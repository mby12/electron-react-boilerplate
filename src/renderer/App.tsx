import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function Hello() {
  // window.electron.ipcRenderer.sendMessage('ipc-example', 'a');
  return (
    <div>
      <h1 className="bg-gray-500 text-center text-white">
        Hi Tailwind has been integrated.
      </h1>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
