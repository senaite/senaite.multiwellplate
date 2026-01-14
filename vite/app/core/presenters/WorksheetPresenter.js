import { rowOrderIndices, columnOrderIndices, shiftOrderIndices, searchTextInObjectValues } from '../helpers/utilities.js';

const generatorFnSelector = {
  'row': rowOrderIndices,
  'col': columnOrderIndices,
  'shift': shiftOrderIndices,
};

const listeners = new Set();
const snapshots = new Map();

class WorksheetPresenter {
  constructor(model, ruleEngine, apiService) {
    this.model = model;
    this.ruleEngine = ruleEngine;
    this.apiService = apiService;
    this.views = new Set();
    this.isLoading = false;
    this.error = null;
    this.selectedAnalyses = new Set();
    this.nextAssignments = [];
    this.nextAction = null;
    this.currentPreposition = {};
    this.prepositionMode = 'row';
  }

  updateView() {
    listeners.forEach(listener => listener());
  }

  updateWellView(wellIdx) {
    this.updateStore(wellIdx);
  }

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  getWellDataSnapshot(idx) {
    const snapshot = snapshots.get(idx);
    if (snapshot) {
      return snapshot;
    }
    // Create initial snapshot if not exists
    const initialSnapshot = {
      isSelectable: this.getWellIdsWithAnalyses().includes(idx),
      isSelected: this.getSelectedWellsForView().includes(idx),
      assignedAnalyses: Object.entries(this.model.analyses)
        .filter(([uid, analysis]) => analysis.wellIdx === idx)
        .map(([uid, analysis]) => ({ uid, ...this.getDataByUid(uid) })) || [],
      prepositionedItems: Object.fromEntries(
        Object.entries(this.getCurrentPreposition())
          .filter(([uid, wellIdx]) => wellIdx === idx)
          .map(([uid, wellIdx]) => [uid, this.getDataByUid(uid)])) || {},
      selectedAnalyses: this.getSelectedAnalyses(),
    };
    snapshots.set(idx, initialSnapshot);
    return initialSnapshot;
  }

  getAssignedListSnaphot() {
    const snapshot = snapshots.get('assignedList');
    if (snapshot) {
      return snapshot;
    }
    const initialSnapshot = this.getAssignedAnalysesUids()
      .map(uid => ({ uid, wellIdx: this.model.analyses[uid].wellIdx }));
    snapshots.set('assignedList', initialSnapshot);
    return initialSnapshot;
  }

  updateAssignedList() {
    const snapshot = this.getAssignedAnalysesUids()
      .map(uid => ({ uid, wellIdx: this.model.analyses[uid].wellIdx }));
    const prevSnapshot = snapshots.get('assignedList');
    const hasChanged = JSON.stringify(snapshot) !== JSON.stringify(prevSnapshot);
    if (hasChanged) {
      snapshots.set('assignedList', snapshot);
      this.updateView();
    }
  }

  getUnassignedListSnapshot() {
    const snapshot = snapshots.get('unassignedList');
    if (snapshot) {
      return snapshot;
    }
    const initialSnapshot = this.getUnassignedAnalysesUids()
      .map(uid => ({ uid, isSelected: this.selectedAnalyses.has(uid), data: this.getDataByUid(uid) }));
    snapshots.set('unassignedList', initialSnapshot);
    return initialSnapshot;
  }

  updateUnassignedList() {
    const snapshot = this.getUnassignedAnalysesUids()
      .map(uid => ({ uid, isSelected: this.selectedAnalyses.has(uid), data: this.getDataByUid(uid) }));
    const prevSnapshot = snapshots.get('unassignedList');
    const hasChanged = JSON.stringify(snapshot) !== JSON.stringify(prevSnapshot);
    if (hasChanged) {
      snapshots.set('unassignedList', snapshot);
      this.updateView();
    }
  }

  updateStore(idx) {
    const snapshot = {
      isSelectable: this.getWellIdsWithAnalyses().includes(idx),
      isSelected: this.getSelectedWellsForView().includes(idx),
      assignedAnalyses: Object.entries(this.model.analyses)
        .filter(([uid, analysis]) => analysis.wellIdx === idx)
        .map(([uid, analysis]) => ({ uid, ...this.getDataByUid(uid) })) || [],
      prepositionedItems: Object.fromEntries(
        Object.entries(this.getCurrentPreposition())
          .filter(([uid, wellIdx]) => wellIdx === idx)
          .map(([uid, wellIdx]) => [uid, this.getDataByUid(uid)])) || {},
      selectedAnalyses: this.getSelectedAnalyses(),
    };
    const prevSnapshot = snapshots.get(idx);
    const hasChanged = JSON.stringify(snapshot) !== JSON.stringify(prevSnapshot);
    if (hasChanged) {
      snapshots.set(idx, snapshot);
      this.updateView();
    }
  }

  async initialize(config) {
    if (config) {
      const rules = config.rules;
      this.model.setData({ rules, ...config });
      this.ruleEngine.setRules(rules);
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
    } catch (error) {
      this.setError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  getConfig() {
    return { fields: this.model.fields, rowsCount: this.model.rowsCount, colsCount: this.model.colsCount } || {};
  }

  findWellIdxByUid(uid) {
    return this.model.analyses[uid]?.wellIdx || null;
  }

  getNextAction() {
    return this.nextAction;
  }

  setNextAction(action) {
    this.nextAction = action;
  }

  getNextAssignments() {
    return this.nextAssignments;
  }

  setNextAssignments(assignments) {
    this.nextAssignments = assignments;
  }

  doNextAction(assignments) {
    const action = this.getNextAction();
    const pairs = assignments || this.getNextAssignments();
    if (action && pairs) {
      action(pairs);
    }
  }

  selectWell(wellIdx) {
    Object.entries(this.model.analyses).forEach(([uid, analysis]) => {
      if (analysis.wellIdx === wellIdx) {
        this.selectedAnalyses.add(uid);
      }
    });
    this.updateWellView(wellIdx);
  }

  deselectWell(wellIdx) {
    Object.entries(this.model.analyses).forEach(([uid, analysis]) => {
      if (analysis.wellIdx === wellIdx) {
        this.selectedAnalyses.delete(uid);
      }
    });
    this.updateWellView(wellIdx);
  }

  deselectAllWells() {
    this.setSelectedAnalyses([]);
  }

  selectAllNonEmptyWells = () => this.getWellIdsWithAnalyses().map(wellIdx => this.selectWell(wellIdx));
  selectAllUnassignedAnalyses = () => this.getUnassignedAnalysesUids().forEach(uid => this.select(uid));

  // ===============
  getAnalyses() {
    return this.model.analyses;
  }

  getAnalysesUids() {
    return Object.keys(this.model.analyses);
  }

  getWellIdsWithAnalyses() {
    return this.model.getWellIdsWithAnalyses();
  }

  getAssignedAnalysesUids() {
    return Object.keys(this.model.analyses).filter(key => this.model.analyses[key].wellIdx);
  }

  // ===============
  getUnassignedAnalyses() {
    return Object.values(this.model.analyses).filter(value => !value.wellIdx);
  }

  getUnassignedAnalysesUids() {
    return Object.keys(this.model.analyses).filter(key => !this.model.analyses[key].wellIdx);
  }

  getSelectedAnalyses() {
    return Array.from(this.selectedAnalyses);
  }

  setSelectedAnalyses(uids) {
    const previousSelectedWells = this.getSelectedWellsForView();
    this.selectedAnalyses = new Set(uids);
    [...new Set([...previousSelectedWells, ...this.getSelectedWellsForView()])].forEach(wellIdx => this.updateWellView(wellIdx));
    this.updateUnassignedList();
  }

  select(uid) {
    this.selectedAnalyses.add(uid);
    this.updateUnassignedList();
  }

  deselect(uid) {
    this.selectedAnalyses.delete(uid);
    this.updateUnassignedList();
  }

  async assignAnalyses(listOfAssignments) {
    {
      this.setLoading(true);
      this.setError(null);
      const prevUsedWellIdxes = new Set();
      const newUsedWellIdxes = new Set();
      const initialState = this.model.analyses;

      try {
        listOfAssignments.forEach(({ uid, wellIdx }) => {
          if (this.model.analyses[uid]?.wellIdx) {
            prevUsedWellIdxes.add(this.model.analyses[uid].wellIdx);
          }
          this.model.assignAnalysis({ uid: uid, wellIdx: wellIdx })
          newUsedWellIdxes.add(wellIdx);
        });
        await this.apiService.write_plate_data(this.model.analyses);
      } catch (error) {
        this.setError(error.message);
        this.model.analyses = initialState;
        prevUsedWellIdxes.forEach(wellIdx => this.updateWellView(wellIdx));
      } finally {
        this.setLoading(false);
        [...new Set([...prevUsedWellIdxes, ...newUsedWellIdxes])].forEach(wellIdx => this.updateWellView(wellIdx));
        this.updateUnassignedList();
        this.updateAssignedList();
      }
    }
  }

  getPrepositionMode() {
    return this.prepositionMode;
  }

  setPrepositionMode(mode) {
    this.prepositionMode = mode;
    this.updateView();
  }

  getCurrentPreposition() {
    return this.currentPreposition;
  }

  setCurrentPreposition(preposition) {
    const prevPreposition = this.currentPreposition;
    this.currentPreposition = preposition;
    [...new Set([...Object.values(prevPreposition), ...Object.values(preposition)])].forEach(wellIdx => this.updateWellView(wellIdx));
  }

  async evaluateRules(facts) {
    return this.ruleEngine.run(facts);
  }

  async getPrepositionedAnalyses({ targetPos, initialPos, uidList, prepositionMode }) {

    const mode = prepositionMode || 'row';
    const prepositioned = {};
    const generatorFn = generatorFnSelector[mode] || rowOrderIndices;

    const { colsCount, rowsCount } = this.model;
    const generatorParams = {
      targetRow: Math.floor((targetPos - 1) / colsCount) + 1,
      targetCol: (targetPos % colsCount) || colsCount,
      initialRow: Math.floor((initialPos - 1) / colsCount) + 1,
      initialCol: (initialPos % colsCount) || colsCount,
      rowsCount,
      colsCount
    };

    const sortedList = [...uidList].sort((a, b) => a.wellIdx - b.wellIdx);

    for (const { uid, wellIdx } of sortedList) {
      const indicesGenerator = generatorFn(generatorParams);

      while (true) {
        const nextIdx = indicesGenerator.next(wellIdx);

        if (nextIdx.done) {
          console.warn('Not enough available wells to preposition all analyses.');
          break;
        }

        const res = await this.ruleEngine.run({ nextIdx: nextIdx.value, uid, prepositioned });
        if (res.events.length > 0) {
          prepositioned[uid] = nextIdx.value;
          break;
        }
      }
    }
    return prepositioned;
  }

  search(filterText) {
    const filterable = Object.entries(this.getConfig().fields)
      .filter(([fieldKey, fieldConfig]) => fieldConfig.filterable)
      .map(([fieldKey, fieldConfig]) => fieldKey);
    return Object.entries(this.model.analyses)
      .filter(([k, v]) => searchTextInObjectValues(
        Object.fromEntries(filterable.map(fieldKey => [fieldKey, v.data[fieldKey]])),
        filterText))
      .map(([k, v]) => k)
  }

  getSelectedWellsForView() {
    return Array.from(this.getSelectedAnalyses().map(uid => this.model.analyses[uid].wellIdx).filter(wellIdx => wellIdx !== null));
  }


  unassignSelected() {
    const assignments = this.getSelectedAnalyses().map(uid => ({ uid: uid, wellIdx: null }))
    this.assignAnalyses(assignments);
    this.deselectAllWells();
  }

  getDataByUid(uid) {
    return this.model.analyses[uid]['data'];
  }

  afterDragCleanUp() {
    this.deselectAllWells();
    this.setNextAction(null);
    this.setSelectedAnalyses([]);
    this.setNextAssignments([]);
  }

  setLoading(loading) {
    this.isLoading = loading;
  }

  setError(error) {
    this.error = error;
  }

}

export default WorksheetPresenter;