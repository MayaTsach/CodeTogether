import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const [codeBlocks, setCodeBlocks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/codeblocks`)
      .then((res) => res.json())
      .then((data) => setCodeBlocks(data))
      .catch((err) => console.error("Failed to load code blocks:", err));
  }, []);

  // const navToBlock = () =>{}

  return (
    <div className="lobby-page">
  <h1 className="lobby-title">🎮 Choose a Code Challenge!</h1>
  
  <div className="code-block-grid">
    {codeBlocks.map((block) => (
      <div key={block._id} className="code-block-card">
        <h2>{block.title} 🧩</h2>
        <button
          className="code-block-button"
          onClick={() => navigate(`/codeblock/${block._id}`)}
        >
          Let's Code 🚀
        </button>
      </div>
    ))}
  </div>
</div>

  );
}

export default App;
