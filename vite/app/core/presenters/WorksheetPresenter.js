import { Almanac } from 'json-rules-engine';
import { rowOrderIndices, columnOrderIndices, shiftOrderIndices, searchTextInObjectValues } from '../helpers/utilities.js';

const generatorFnSelector = {
  'row': rowOrderIndices,
  'col': columnOrderIndices,
  'shift': shiftOrderIndices,
};

const listeners = new Set();
const unassignedListeners = new Set();
const assignedListeners = new Set();
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
    this.listOrder = [];
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

  subscribeUnassigned(listener) {
    unassignedListeners.add(listener);
    return () => unassignedListeners.delete(listener);
  }

  subscribeAssigned(listener) {
    assignedListeners.add(listener);
    return () => assignedListeners.delete(listener);
  }

  getAssignedListSnapshot() {
    const cached = snapshots.get('assignedList');
    if (cached) return cached;
    const snapshot = Object.fromEntries(
      Object.entries(this.getAnalyses())
        .filter(([, a]) => a.wellIdx)
        .map(([uid, a]) => [uid, { ...a, isSelected: this.selectedAnalyses.has(uid) }])
    );
    snapshots.set('assignedList', snapshot);
    return snapshot;
  }

  _syncAssignedListSnapshot() {
    const prev = snapshots.get('assignedList');
    const assignedEntries = Object.entries(this.getAnalyses()).filter(([, a]) => a.wellIdx);
    const changed = !prev
      || Object.keys(prev).length !== assignedEntries.length
      || assignedEntries.some(([uid]) => !prev[uid] || prev[uid].isSelected !== this.selectedAnalyses.has(uid));
    if (changed) {
      snapshots.set('assignedList', Object.fromEntries(
        assignedEntries.map(([uid, a]) => [uid, { ...a, isSelected: this.selectedAnalyses.has(uid) }])
      ));
      assignedListeners.forEach(l => l());
    }
  }

  getUnassignedListSnapshot() {
    const cached = snapshots.get('unassignedList');
    if (cached) return cached;
    const snapshot = Object.fromEntries(
      Object.entries(this.getAnalyses())
        .filter(([, a]) => !a.wellIdx)
        .map(([uid, a]) => [uid, { ...a, isSelected: this.selectedAnalyses.has(uid) }])
    );
    snapshots.set('unassignedList', snapshot);
    return snapshot;
  }

  _syncUnassignedListSnapshot() {
    const prev = snapshots.get('unassignedList');
    const unassignedEntries = Object.entries(this.getAnalyses()).filter(([, a]) => !a.wellIdx);
    const changed = !prev
      || Object.keys(prev).length !== unassignedEntries.length
      || unassignedEntries.some(([uid]) => !prev[uid] || prev[uid].isSelected !== this.selectedAnalyses.has(uid));
    if (changed) {
      snapshots.set('unassignedList', Object.fromEntries(
        unassignedEntries.map(([uid, a]) => [uid, { ...a, isSelected: this.selectedAnalyses.has(uid) }])
      ));
      unassignedListeners.forEach(l => l());
    }
  }

  _buildWellSnapshot(idx) {
    const assignedAnalyses = Object.entries(this.model.analyses)
      .filter(([, analysis]) => analysis.wellIdx === idx)
      .map(([uid]) => ({ uid, ...this.getDataByUid(uid) }));
    return {
      isSelectable: assignedAnalyses.length > 0,
      isSelected: this.selectedAnalyses.size > 0 && assignedAnalyses.some(a => this.selectedAnalyses.has(a.uid)),
      assignedAnalyses,
      prepositionedItems: Object.fromEntries(
        Object.entries(this.getCurrentPreposition())
          .filter(([, wellIdx]) => wellIdx === idx)
          .map(([uid]) => [uid, this.getDataByUid(uid)])),
      selectedAnalyses: assignedAnalyses.filter(a => this.selectedAnalyses.has(a.uid)).map(a => a.uid),
    };
  }

  // Updates snapshot without triggering updateView. Returns true if snapshot changed.
  _syncWellSnapshot(idx) {
    const snapshot = this._buildWellSnapshot(idx);
    const prev = snapshots.get(idx);
    const hasChanged = !prev
      || prev.isSelectable !== snapshot.isSelectable
      || prev.isSelected !== snapshot.isSelected
      || prev.assignedAnalyses.length !== snapshot.assignedAnalyses.length
      || prev.selectedAnalyses.length !== snapshot.selectedAnalyses.length
      || prev.assignedAnalyses.some((a, i) => a.uid !== snapshot.assignedAnalyses[i].uid)
      || prev.selectedAnalyses.some((uid, i) => uid !== snapshot.selectedAnalyses[i])
      || JSON.stringify(prev.prepositionedItems) !== JSON.stringify(snapshot.prepositionedItems);
    if (hasChanged) snapshots.set(idx, snapshot);
    return hasChanged;
  }

  getWellDataSnapshot(idx) {
    const snapshot = snapshots.get(idx);
    if (snapshot) {
      return snapshot;
    }
    const initialSnapshot = this._buildWellSnapshot(idx);
    snapshots.set(idx, initialSnapshot);
    return initialSnapshot;
  }

  updateStore(idx) {
    if (this._syncWellSnapshot(idx)) {
      this.updateView();
    }
  }

  getAnalysesListSnapshot() {
    const snapshot = snapshots.get('analysesList');
    if (snapshot) {
      return snapshot;
    }
    const initialSnapshot = Object.fromEntries(Object.entries(this.getAnalyses()).map(([uid, analysis]) => ([uid, {...analysis, isSelected: this.selectedAnalyses.has(uid)}])));
    snapshots.set('analysesList', initialSnapshot);
    return initialSnapshot;
  }

  updateAnalysesList() {
    const prevSnapshot = snapshots.get('analysesList');
    if (!prevSnapshot) {
      const snapshot = Object.fromEntries(Object.entries(this.getAnalyses()).map(([uid, a]) => [uid, { ...a, isSelected: this.selectedAnalyses.has(uid) }]));
      snapshots.set('analysesList', snapshot);
      this.updateView();
      return;
    }
    let changed = false;
    const snapshot = Object.fromEntries(
      Object.entries(this.getAnalyses()).map(([uid, a]) => {
        const isSelected = this.selectedAnalyses.has(uid);
        if (prevSnapshot[uid]?.isSelected !== isSelected || prevSnapshot[uid]?.wellIdx !== a.wellIdx) changed = true;
        return [uid, { ...a, isSelected }];
      })
    );
    if (changed) {
      snapshots.set('analysesList', snapshot);
      this._syncUnassignedListSnapshot();
      this._syncAssignedListSnapshot();
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
    this._syncWellSnapshot(wellIdx);
    this.updateAnalysesList();
  }

  deselectWell(wellIdx) {
    Object.entries(this.model.analyses).forEach(([uid, analysis]) => {
      if (analysis.wellIdx === wellIdx) {
        this.selectedAnalyses.delete(uid);
      }
    });
    this._syncWellSnapshot(wellIdx);
    this.updateAnalysesList();
  }

  deselectAllWells() {
    this.setSelectedAnalyses([]);
  }

  selectAllNonEmptyWells = () => this.setSelectedAnalyses(this.getAssignedAnalysesUids());
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

  setListOrder(uids) {
    this.listOrder = uids;
  }

  getSelectedAnalyses() {
    if (this.listOrder.length) {
      const ordered = this.listOrder.filter(uid => this.selectedAnalyses.has(uid));
      const rest = Array.from(this.selectedAnalyses).filter(uid => !this.listOrder.includes(uid));
      return [...ordered, ...rest];
    }
    return Array.from(this.selectedAnalyses);
  }

  getSelectedAnalysesInWell(idx) {
    return Object.entries(this.model.analyses)
      .filter(([uid, analysis]) => analysis.wellIdx === idx && this.selectedAnalyses.has(uid))
      .map(([uid, analysis]) => ({ uid, ...this.getDataByUid(uid) })) || [];
  }

  setSelectedAnalyses(uids) {
    const previousSelectedWells = this.getSelectedWellsForView();
    this.selectedAnalyses = new Set(uids);
    [...new Set([...previousSelectedWells, ...this.getSelectedWellsForView()])].forEach(wellIdx => this.updateWellView(wellIdx));
    this.updateAnalysesList();
  }

  extendSelectedAnalyses(uids) {
    const affectedWells = new Set(uids.map(uid => this.model.analyses[uid]?.wellIdx).filter(Boolean));
    uids.forEach(uid => this.selectedAnalyses.add(uid));
    affectedWells.forEach(wellIdx => this._syncWellSnapshot(wellIdx));
    this.updateAnalysesList();
  }

  select(uid) {
    this.selectedAnalyses.add(uid);
    if (this.model.analyses[uid]?.wellIdx) {
      this._syncWellSnapshot(this.model.analyses[uid].wellIdx);
    }
    this.updateAnalysesList();
  }

  deselect(uid) {
    this.selectedAnalyses.delete(uid);
    if (this.model.analyses[uid]?.wellIdx) {
      this._syncWellSnapshot(this.model.analyses[uid].wellIdx);
    }
    this.updateAnalysesList();
  }

  selectColumn(col) {
    const colWells = Array.from({ length: this.model.rowsCount }, (_, i) => i * this.model.colsCount + col).filter(wellIdx => this.model.getWellIdsWithAnalyses().includes(wellIdx));
    const uidsToSelect = Object.entries(this.model.analyses)
      .filter(([, analysis]) => colWells.includes(analysis.wellIdx))
      .map(([uid]) => uid);
    this.selectMany(uidsToSelect);
  }

  deselectColumn(col) {
    const colWells = Array.from({ length: this.model.rowsCount }, (_, i) => i * this.model.colsCount + col).filter(wellIdx => this.model.getWellIdsWithAnalyses().includes(wellIdx));
    const uidsToDeselect = Object.entries(this.model.analyses)
      .filter(([, analysis]) => colWells.includes(analysis.wellIdx))
      .map(([uid]) => uid);
    this.deselectMany(uidsToDeselect);
  }

  selectRow(row) {
    const rowWells = Array.from({ length: this.model.colsCount }, (_, i) => (row - 1) * this.model.colsCount + i + 1).filter(wellIdx => this.model.getWellIdsWithAnalyses().includes(wellIdx));
    const uidsToSelect = Object.entries(this.model.analyses)
      .filter(([, analysis]) => rowWells.includes(analysis.wellIdx))
      .map(([uid]) => uid);
    this.selectMany(uidsToSelect);
  }

  deselectRow(row) {
    const rowWells = Array.from({ length: this.model.colsCount }, (_, i) => (row - 1) * this.model.colsCount + i + 1).filter(wellIdx => this.model.getWellIdsWithAnalyses().includes(wellIdx));
    const uidsToDeselect = Object.entries(this.model.analyses)
      .filter(([, analysis]) => rowWells.includes(analysis.wellIdx))
      .map(([uid]) => uid);
    this.deselectMany(uidsToDeselect);
  }

  getUidsByColumn(col) {
    const colWells = Array.from({ length: this.model.rowsCount }, (_, i) => i * this.model.colsCount + col).filter(wellIdx => this.model.getWellIdsWithAnalyses().includes(wellIdx));
    return Object.entries(this.model.analyses)
      .filter(([, analysis]) => colWells.includes(analysis.wellIdx))
      .map(([uid]) => uid);
  }

  getUidsByRow(row) {
    const rowWells = Array.from({ length: this.model.colsCount }, (_, i) => (row - 1) * this.model.colsCount + i + 1).filter(wellIdx => this.model.getWellIdsWithAnalyses().includes(wellIdx));
    return Object.entries(this.model.analyses)
      .filter(([, analysis]) => rowWells.includes(analysis.wellIdx))
      .map(([uid]) => uid);
  }

  selectMany(uids) {
    const affectedWells = new Set(uids.map(uid => this.model.analyses[uid]?.wellIdx).filter(Boolean));
    uids.forEach(uid => this.selectedAnalyses.add(uid));
    affectedWells.forEach(wellIdx => this._syncWellSnapshot(wellIdx));
    this.updateAnalysesList();
  }

  deselectMany(uids) {
    const affectedWells = new Set(uids.map(uid => this.model.analyses[uid]?.wellIdx).filter(Boolean));
    uids.forEach(uid => this.selectedAnalyses.delete(uid));
    affectedWells.forEach(wellIdx => this._syncWellSnapshot(wellIdx));
    this.updateAnalysesList();
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
        this.updateAnalysesList();
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
    const wells = new Set([...Object.values(prevPreposition), ...Object.values(preposition)]);
    let changed = false;
    wells.forEach(wellIdx => { if (this._syncWellSnapshot(wellIdx)) changed = true; });
    if (changed) this.updateView();
  }

  async evaluateRules(facts) {
    return this.ruleEngine.run(facts).then(async ({ events, almanac }) => {
      const overallPass = await Promise.resolve(almanac.factValue('overall-pass'));
      return overallPass;
    });
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

        const overallPass = await this.evaluateRules({ nextIdx: nextIdx.value, uid, prepositioned }).then((overallPass) => {
          if (overallPass && nextIdx.value) {
            prepositioned[uid] = nextIdx.value;
            return true;
          }
          return false;
        });

        if (overallPass) break; // proceed to next analysis if evaluation successful
      }
    }
    return prepositioned;
  }

  search(filterText) {
    if (!filterText) return Object.keys(this.model.analyses);
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
    return Array.from(this.getSelectedAnalyses().map(uid => this.model.analyses[uid]?.wellIdx).filter(wellIdx => wellIdx !== null));
  }


  unassignMany(uids) {
    const assignments = uids.map(uid => ({ uid: uid, wellIdx: null }));
    this.assignAnalyses(assignments);
    this.deselectMany(uids);
  }
  
  unassignSelected() {
    const assignments = this.getSelectedAnalyses().map(uid => ({ uid: uid, wellIdx: null }))
    this.assignAnalyses(assignments);
    this.deselectAllWells();
  }

  getDataByUid(uid) {
    return this.model.analyses[uid]['data'];
  }

  getWorksheetId() {
    return this.model?.worksheetId || '';
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