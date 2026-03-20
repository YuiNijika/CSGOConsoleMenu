import { CSGOMenu } from "./components/CSGOMenu"
import { TitleBar } from "./components/TitleBar"
import { Toaster } from "sonner"
import "./App.css"

function App() {
  return (
    <div className="flex flex-col h-screen w-screen">
      <TitleBar />
      <div className="flex-1 overflow-auto">
        <CSGOMenu />
      </div>
      <Toaster richColors position="bottom-center" />
    </div>
  )
}

export default App;
