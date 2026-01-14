import { Engine } from 'json-rules-engine';

class RuleEngineService {

    constructor(model, rules = []) {
        this.model = model;
        this.engine = new Engine([], { cache: true, replaceFactsInEventParams: true });
        this.setBuiltInFacts();

    }

    run(facts) {
        return this.engine.run(facts);
    }

    setRules(rules) {
        Object.entries(rules).forEach(([key, value]) => this.engine.addRule(value.body));
    }

    setBuiltInFacts() {
        
        this.engine.addFact('all-ids', () => Array.from({ length: this.model.rowsCount * this.model.colsCount }, (_, index) => index + 1));

        this.engine.addFact('empty-ids', (params, almanac) => {
            const uid = Promise.resolve(almanac.factValue('uid'));
            const prepositioned = Promise.resolve(almanac.factValue('prepositioned'));
            return Promise.all([uid, prepositioned]).then(([uid, prepositioned]) => {
                const emptyIds = [...new Set(this.model.getWellIdsEmpty()), this.model.analyses[uid].wellIdx];
                const excludedIds = Object.entries(prepositioned).filter(([k, v]) => k !== uid).map(([k, v]) => v);
                return [...emptyIds].filter(id => !excludedIds.includes(id));
            });
        });

        this.engine.addFact('uid-data', (params, almanac) => {
            const uid = Promise.resolve(almanac.factValue('uid'));
            return uid.then(uid => {
                return this.model.analyses[uid]?.data || {};
            });
        });

        this.engine.addFact('well-data', (params, almanac) => {
            const nextIdx = Promise.resolve(almanac.factValue('nextIdx'));
            const prepositioned = Promise.resolve(almanac.factValue('prepositioned'));
            return Promise.all([nextIdx, prepositioned]).then(([nextIdx, prepositioned]) => {
                const assignedIdxes = Object.values(this.model.analyses)
                                            .filter(v => v.wellIdx === nextIdx)
                                            .map(v => v.data[params.fieldName]);
                const prepositionedIdxes = Object.entries(prepositioned)
                                                 .filter(([k, v]) => v === nextIdx)
                                                 .map(([k, v]) => this.model.analyses[k].data[params.fieldName]);
                return [...assignedIdxes, ...prepositionedIdxes];
            });
        });
    }
}

export default RuleEngineService;