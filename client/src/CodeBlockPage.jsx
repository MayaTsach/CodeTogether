import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";
import { autocompletion } from "@codemirror/autocomplete";
import "./CodeBlockPage.css";


export default function CodeBlockPage() {
  const { id } = useParams();
  const socketRef = useRef(null); 
  const [codeBlock, setCodeBlock] = useState(null);
  const [code, setCode] = useState("");
  const [role, setRole] = useState(null);
  const [studentCount, setStudentCount] = useState(0);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");
  const [askedName, setAskedName] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [mentorMessage, setMentorMessage] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

 
  
  function handleCodeChange(value) { 
    setCode(value);

    if (role === "student") {
      socketRef.current.emit("codeChange", {
        roomId: id,
        newCode: value
      });  
    }

    //check if the code is correct (same as solutionCode)
    if (value.trim() === codeBlock.solutionCode.trim()) {  // trim removes extra spaces
        setSuccess(true);
        socketRef.current.emit("solved", { roomId: id });
      }
    else {
        setSuccess(false);
        socketRef.current.emit("unsolved", { roomId: id });
    }      
  }
   

  useEffect(() => {
    if (!askedName) return; // Don't run if name not asked yet

    socketRef.current = io(backendUrl);  // Create socket 

    socketRef.current.emit("joinRoom", { roomId: id, name });
    
    // Fetch code block
    fetch(`${backendUrl}/api/codeblocks/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCodeBlock(data);
        setCode(data.initialCode);
      });
      
      
    // Role assignment
    socketRef.current.on("roleAssigned", (assignedRole) => {
      setRole(assignedRole);
      console.log("Your role is:", assignedRole);
    });

    // Handle mentor disconnect
    socketRef.current.on("roomClosed", () => {
      alert("Mentor left. Returning to lobby.");
      window.location.href = "/"; //returns to homepage
    });

    // When receiving code update from students
    socketRef.current.on("codeUpdate", (newCode) => {
        setCode(newCode);
    });

    // Handle student count update
    socketRef.current.on("studentCount", (count) => {
        setStudentCount(count);
      });
    
    // Handle student list update
    socketRef.current.on("studentList", (list) => {
      if (Array.isArray(list)) {
        const normalized = list.map((entry) =>
          typeof entry === "string" ? { name: entry, solved: false } : entry
        );
        setStudentList(normalized);
      }
    });

    // Handle message from mentor
    socketRef.current.on("mentorMessage", (msg) => {
      setMentorMessage(msg);
    });
    
    
      
      
      
    // Clean up on leave
    return () => {
      socketRef.current.disconnect();
    };
  }, [id, askedName]);

  if (!askedName) { // Ask for name if not already asked and not the mentor
    return (
      <div className="name-prompt">
        <h2>🎓 What's your name?</h2>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={() => {
            if (name.trim()) setAskedName(true);
          }}
        >
          Let's go!
        </button>
      </div>
    );
  }

  if (!codeBlock || !role) { // Loading state
    return (
      <div className="loading-screen">
        <p>🔄 Loading your code block...</p>
      </div>
    );
  }

  

  return ( // Main code block page
    <div className="page-layout">
      <button className="return-button" onClick={() => window.location.href = "/"}>
          <i className="fa-regular fa-circle-left"></i>
      </button>

      <div className="code-page-grid">  

        <div className="code-block-container">
          <h2 className="code-block-title">{codeBlock.title} 🧩</h2>      

          {success && (
            <div className="success-smiley">🎉 😄 🎉</div>
          )}
      
          <p className="code-block-instructions">
            {codeBlock.instructions}
          </p>
      
          <CodeMirror
            value={code}
            height="400px"
            className="code-editor"
            extensions={[javascript(), autocompletion(), EditorView.lineWrapping]}
            readOnly={role === "mentor"}
            onChange={handleCodeChange}
          />

          {role === "mentor" && (   //Mentor message form
          <div className="mentor-message-form">
            <input
              type="text"
              placeholder="Send message to students..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />

            <button
              onClick={() => {
                if (messageInput.trim()) {
                  socketRef.current.emit("mentorMessage", {
                    roomId: id,
                    message: messageInput.trim(),
                  });
                  setMessageInput(""); // Clear input
                }
              }}
            >
              Send
            </button>
          </div>
        )}

        {mentorMessage && (
          <div className="mentor-announcement">
            📢 {mentorMessage}
          </div>
        )}

      </div>

          <div className="student-list-panel">
            <div className="role-and-count">
              <span className="role-pill">
                {role === "mentor" ? "Mentor 👨‍🏫" : "Student 🎓"}
              </span>
              <span className="count-pill">
                {studentCount} student{studentCount !== 1 ? "s" : ""} connected
              </span>
            </div>

            <p><strong>Students in Room:</strong></p>
            <ul>
              {studentList.map((s, i) => (
                <li key={i}>
                  👩‍💻 {s.name} {s.solved && <span style={{ color: "green" }}>✅</span>}
                </li>
              ))}
            </ul>
            
            

          </div>
        </div>
    </div>
  );
  
  
}
