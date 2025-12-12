import { rowOrderIndices, columnOrderIndices, shiftOrderIndices, searchTextInObjectValues } from '../helpers/utilities.js';

const generatorFnSelector = {
  'row': rowOrderIndices,
  'col': columnOrderIndices,
  'shift': shiftOrderIndices,
};

class WorksheetPresenter {
  constructor(model, apiService) {
    this.model = model;
    this.apiService = apiService;
    this.view = null;
    this.isLoading = false;
    this.error = null;
    this.selectedWells = new Set();
    this.selectedUnassigned = new Set();
    this.nextActionUids = new Set();
    this.nextAssignments = {};
    this.nextAction = null;
  }

  setView(view) {
    this.view = view;
  }

  updateView() {
    if (this.view) {
      this.view.forceUpdate();
    }
  }

  async initialize(config) {
    if (config) {
      this.model.setData(config)
    } else {
      await this.loadData();
    }
  }

  async loadData() {
    this.setLoading(true);
    this.setError(null);

    try {
      const data = await this.apiService.fetch();
      console.log(data);
      this.model.setData(data);
      this.updateView();
    } catch (error) {
      this.setError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  getConfig() {
    return {fields: this.model.fields, rowsCount: this.model.rowsCount, colsCount: this.model.colsCount} || {};
  }

  findUidByWellIdx(wellIdx) {
    const res = Object.keys(this.model.analyses).filter(key => this.model.analyses[key].wellIdx == wellIdx);
    return res.length === 1 ? res[0] : null;
  }

  getAnalysis(uid) {
    return this.model.analyses[uid];
  }

  getNextAction() {
    return this.nextAction;
  }

  setNextAction(action) {
    this.nextAction = action;
  }

  cleanNextAction() {
    this.nextAction = () => { };
  }

  getNextActionUid() {
    return Array.from(this.nextActionUids)[0];
  }

  getNextActionUids() {
    return Array.from(this.nextActionUids);
  }

  setNextActionsUids(analysisIds) {
    this.nextActionUids = new Set(analysisIds);
    this.updateView();
  }

  getNextAssignments() {
    return this.nextAssignments;
  }

  setNextAssignments(assignments) {
    this.nextAssignments = assignments;
  }

  cleanNextActionsUids() {
    this.nextActionUids = new Set();
  }

  doNextAction(assignments) {
    const action = this.getNextAction();
    const pairs = assignments || this.getNextAssignments();
    if (action && pairs) {
      action(pairs);
    }
  }

  selectWell(well) {
    if (!this.selectedWells) { this.selectedWells = new Set(); }
    this.selectedWells.add(well);
    this.updateView();
  }

  deselectWell(well) {
    if (this.selectedWells) { this.selectedWells.delete(well); }
    this.updateView();
  }

  deselectAllWells() {
    this.setSelectedWells([]);
  }

  selectAllNonEmptyWells = () => this.setSelectedWells(this.getWellIdsWithAnalyses());

  setSelectedWells(wells) {
    this.selectedWells = new Set(wells);
    this.updateView();
  }

  getAnalysesUids() {
    return Object.keys(this.model.analyses);
  }

  getWellIdsWithAnalyses() {
    return this.model.getWellIdsWithAnalyses();
  }

  getUnassignedAnalyses() {
    return Object.values(this.model.analyses).filter(value => !value.wellIdx);
  }

  getUnassignedAnalysesUids() {
    return Object.keys(this.model.analyses).filter(key => !this.model.analyses[key].wellIdx);
  }

  setSelectedUnassigned(analysisIds) {
    this.selectedUnassigned = new Set(analysisIds);
    this.updateView();
  }

  getSelectedUnassigned() {
    return Array.from(this.selectedUnassigned);
  }

  cleanSelectedUnassigned() {
    this.selectedUnassigned = new Set();
    this.updateView();
  }

  async assignAnalysis({ uid, wellIdx }) {
    await assignAnalyses([{uid, wellIdx}])
  }

  async assignAnalyses(listOfAssignments) {
    {
      this.setLoading(true);
      this.setError(null);
      const initialState = this.model.analyses;

      try {
        listOfAssignments.forEach(({ uid, wellIdx }) => {
          this.model.assignAnalysis({ uid: uid, wellIdx: wellIdx })
        });
        await this.apiService.write_plate_data(this.model.analyses);
        this.updateView();
      } catch (error) {
        this.setError(error.message);
        this.model.analyses = initialState;
      } finally {
        this.setLoading(false);
      }
    }
  }

  // async unassignAnalysis({ uid }) {
  //   this.setLoading(true);
  //   this.setError(null);

  //   try {
  //     await this.apiService.unassignAnalysis({ uid });
  //     this.model.unassignAnalysis({ uid });
  //     this.updateView();
  //   } catch (error) {
  //     this.setError(error.message);
  //   } finally {
  //     this.setLoading(false);
  //   }
  // }

  // async unassignAnalyses(uids) {
  //   this.setLoading(true);
  //   this.setError(null);

  //   try {
  //     await this.apiService.unassignAnalyses(uids);
  //     uids.map(item => this.model.unassignAnalysis(item));
  //     this.deselectAllWells();
  //     this.updateView();
  //   } catch (error) {
  //     this.setError(error.message);
  //   } finally {
  //     this.setLoading(false);
  //   }
  // }

  getPrepositionedAnalyses({ targetPos, initialPos, uidList, prepositionMode }) {
    const mode = prepositionMode || 'row';
    const prepositioned = {};
    const availableWellIndices = new Set(this.model.getWellIdsEmpty());
    const generatorFn = generatorFnSelector[mode] || rowOrderIndices;
    const indicesGenerator = generatorFn({
      targetRow: Math.floor((targetPos - 1) / this.model.colsCount) + 1,
      targetCol: ((targetPos) % this.model.colsCount),
      initialRow: Math.floor((initialPos - 1) / this.model.colsCount) + 1,
      initialCol: ((initialPos) % this.model.colsCount),
      rowsCount: this.model.rowsCount,
      colsCount: this.model.colsCount
    });

    for (const { uid, wellIdx } of uidList.sort((a, b) => a.wellIdx - b.wellIdx)) {
      let found = false;
      while (!found) {
        const nextIdx = indicesGenerator.next(wellIdx);
        if (nextIdx.done) {
          console.warn('Not enough available wells to preposition all analyses.');
          found = true;
          continue;
        }
        if (availableWellIndices.has(nextIdx.value)) {
          prepositioned[uid] = nextIdx.value;
          availableWellIndices.delete(nextIdx.value);
          found = true;
        }
      }
    }

    return prepositioned;
  }

  handleFilterChange(filterText) {
    this.model.setFilter(filterText);
    this.updateView();
  }

  search(filterText) {    
    return Object.entries(this.model.analyses).filter(([k,v]) => searchTextInObjectValues(v.data, filterText)).map(([k, v]) => k)
  }

  getWellsForView() {
    return this.model.getWells();
  }

  getSelectedWellsForView() {
    return this.selectedWells;
  }

  getSelectedWellsAssigments() {
    return this.selectedWells;
  }

  cleanSelectedWells() {
    const assignments = Array.from(this.getSelectedWellsForView()).map(wellIdx => {
      return { uid: this.findUidByWellIdx(wellIdx), wellIdx: null};
    });
    this.assignAnalyses(assignments);
    this.deselectAllWells();
  }

  getFilterForView() {
    return this.model.getFilter();
  }

  getDataByUid(uid) {
    return this.model.analyses[uid]['data'];
  }

  afterDragCleanUp() {
    this.deselectAllWells();
    this.cleanSelectedUnassigned();
    this.setNextAction(null);
    this.setNextAssignments({});
  }

  isLoadingForView() {
    return this.isLoading;
  }

  getErrorForView() {
    return this.error;
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.updateView();
  }

  setError(error) {
    this.error = error;
    this.updateView();
  }


}

export default WorksheetPresenter;