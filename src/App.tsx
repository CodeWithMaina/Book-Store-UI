import "./App.scss";
import { store } from "./app/store";
import { Book } from "./components/Book";
import { Provider } from "react-redux";
function App() {
  return (
    <>
      <Provider store={store}>
        <Book />
      </Provider>
    </>
  );
}

export default App;
