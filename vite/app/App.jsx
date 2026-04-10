import { useState } from 'react';
import WorksheetModel from './core/domain/WorksheetModel';
import RuleEngineService from './core/services/RuleEngineService';
import WorksheetPresenter from './core/presenters/WorksheetPresenter';
import WorksheetApiService from './core/services/WorksheetApiService';
import MockWorksheetApiService from './core/services/MockWorksheetApiService';
import Layout from './components/Layout'
import ExternalLabels from './components/Controls/ExternalLabels';
import { AppContext } from './AppContext';
import { DEFAULT_LAYOUT_MODE } from './config.js';

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

  const [anchor, setAnchor] = useState(null); 
  const [mode, setMode] = useState(config?.startMode || DEFAULT_LAYOUT_MODE);
  const context = { presenter, mode, setMode, anchor, setAnchor}
  
  return (
    <AppContext.Provider value={context}>
      <Layout />
      <ExternalLabels />
    </AppContext.Provider>
  )
}

export default App
