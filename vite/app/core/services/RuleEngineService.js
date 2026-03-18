import { Engine, Rule } from 'json-rules-engine';
import { findObjectsByType } from '../helpers/utilities.js';

class RuleEngineService {

    constructor(model, rules = []) {
        this.model = model;
        this.engine = new Engine([], {
            cache: true, replaceFactsInEventParams: true
        });
        this.setBuiltinFacts();
    }

    run(facts) {
        const res = this.engine.run(facts);
        return res;
    }

    setRules(rules) {
        for (const [index, rule] of rules.entries()) {
            try {
                this.engine.addRule(new Rule(rule));
            } catch (error) {
                console.error(`RULE INIT FAILED: ${index+1} ${rule}`)
            }
        }
    }

    setBuiltinFacts() {

        // generate array all well indexes available in the plate
        this.engine.addFact('all-ids', () => Array.from({ length: this.model.rowsCount * this.model.colsCount }, (_, index) => index + 1));

        // function returning array of well indexes that are empty (no analyses assigned)
        this.engine.addFact('empty-ids', async (params, almanac) => {
            const uid = Promise.resolve(almanac.factValue('uid'));
            const prepositioned = Promise.resolve(almanac.factValue('prepositioned'));
            return Promise.all([uid, prepositioned]).then(([uid, prepositioned]) => {
                const emptyIds = [...new Set(this.model.getWellIdsEmpty()), this.model.analyses[uid].wellIdx];
                const excludedIds = Object.entries(prepositioned).filter(([k, v]) => k !== uid).map(([k, v]) => v);
                return [...emptyIds].filter(id => !excludedIds.includes(id));
            });
        });

        // fact returning data object of the analysis identified by 'uid' fact
        this.engine.addFact('uid-data', async (params, almanac) => {
            const uid = Promise.resolve(almanac.factValue('uid'));
            return uid.then(uid => {
                return this.model.analyses[uid]?.data || {};
            });
        });

        // fact returning array of data values for all analyses assigned or prepositioned to the well identified by 'nextIdx' fact
        this.engine.addFact('well-data', async (params, almanac) => {
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

        // fact returning boolean indicating whether all succesfully evaluated conditions of type 'precondition' and 'body' passed
        this.engine.addFact('overall-pass', (params, almanac) => {
            for (const ruleResult of almanac.ruleResults) {
                if (ruleResult.result || findObjectsByType(ruleResult.conditions, { type: 'precondition', result: false }).length) continue;
                if (findObjectsByType(ruleResult.conditions, { type: 'body', result: false }).length) return false;
            }
            return true;
        }, { cache: false });
    }

}

export default RuleEngineService;