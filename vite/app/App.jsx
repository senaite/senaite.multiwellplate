import { createContext, useEffect, useState } from 'react';
import WorksheetModel from './core/domain/WorksheetModel';
import WorksheetPresenter from './core/presenters/WorksheetPresenter';
import WorksheetApiService from './core/services/WorksheetApiService';
import MockWorksheetApiService from './core/services/MockWorksheetApiService';
import Layout from './components/Layout'
import OutsideTogglers from './components/Controls/OutsideTogglers';


export const WorksheetPresenterContext = createContext(null)

function App({ config }) {

  const [presenter] = useState(() => {
    const model = new WorksheetModel();
    const url = `/worksheets/${config.worksheetId}/`;
    const apiService = import.meta.env.PROD ?
      new WorksheetApiService(url) : new MockWorksheetApiService();
    const presenter = new WorksheetPresenter(model, apiService);
    presenter.initialize(config);
    return presenter;
  });

  const [, setUpdateTrigger] = useState(0);

  useEffect(() => {
     presenter.setView({
      forceUpdate: () => setUpdateTrigger(prev => prev + 1)
    });
  }, [presenter]);


  return (
    <WorksheetPresenterContext.Provider value={presenter}>
      <Layout startMode={ config?.startMode }/>
      <OutsideTogglers />
    </WorksheetPresenterContext.Provider>
  )
}

export default App
