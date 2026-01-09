import { WalletContextProvider } from "./context/WalletContextProvider";
import { Route, Switch, useLocation } from "wouter";
import AccessPage from "./pages/AccessPage";
import GameInterface from "./pages/GameInterface";
import PredictionMarket from "./pages/PredictionMarket";
import { ProtectedRoute } from "./components/ProtectedRoute";

function Home() {
  const [, setLocation] = useLocation();
  return <AccessPage onEnter={() => setLocation("/game")} />;
}

function App() {
  return (
    <WalletContextProvider>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/game">
          <ProtectedRoute>
            <GameInterface />
          </ProtectedRoute>
        </Route>
        <Route path="/prediction">
          <ProtectedRoute>
            <PredictionMarket />
          </ProtectedRoute>
        </Route>
        {/* Fallback route */}
        <Route component={Home} />
      </Switch>
    </WalletContextProvider>
  );
}

export default App;
