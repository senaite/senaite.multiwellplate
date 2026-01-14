import { createContext, useEffect, useState } from 'react';
import WorksheetModel from './core/domain/WorksheetModel';
import RuleEngineService from './core/services/RuleEngineService';
import WorksheetPresenter from './core/presenters/WorksheetPresenter';
import WorksheetApiService from './core/services/WorksheetApiService';
import MockWorksheetApiService from './core/services/MockWorksheetApiService';
import Layout from './components/Layout'
import ExternalLabels from './components/Controls/ExternalLabels';


export const WorksheetPresenterContext = createContext(null)


function App({ config }) {

  const [presenter] = useState(() => {
    
    const url = `/worksheets/${config.worksheetId}/`;

    const model = new WorksheetModel();
    const ruleEngine = new RuleEngineService(model);
    const apiService = import.meta.env.PROD ?
      new WorksheetApiService(url) : new MockWorksheetApiService();
    const presenter = new WorksheetPresenter(model, ruleEngine, apiService);
    presenter.initialize(config);
    return presenter;
  });

  return (
    <WorksheetPresenterContext.Provider value={presenter}>
      <Layout startMode={ config?.startMode }/>
      <ExternalLabels />
    </WorksheetPresenterContext.Provider>
  )
}

export default App
