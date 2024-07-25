import React, { useState, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import UserContext from './UserContext';
import 'simplemde/dist/simplemde.min.css';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/autocomplete';
import './assets/css/Home.css';

function Home() {
  const userInfo = useContext(UserContext);
  const [fileList, setFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editor, setEditor] = useState(null);
  const [fileSearch, setFileSearch] = useState('');
  const [newFilename, setNewFilename] = useState('');

  useEffect(() => {
    if (!userInfo.email) {
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/simplemde@1.11.2/dist/simplemde.min.js';
    script.onload = () => {
      const mde = new window.SimpleMDE({ element: document.getElementById('editor') });
      setEditor(mde);
      refreshFileList();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [userInfo.email]);

  const refreshFileList = () => {
    fetch('/listFiles')
      .then(response => response.json())
      .then(data => {
        setFileList(data);
        $('#fileSearch').autocomplete({
          source: data.map(item => item.name),
          select: (event, ui) => {
            if (ui.item) {
              loadFile(ui.item.value);
            }
          },
          response: (event, ui) => {
            if (ui.content.length === 0) {
              $('.ui-autocomplete').hide();
            }
          }
        });
      })
      .catch(error => console.error('Error fetching file list:', error));
  };

  const loadFile = (filename) => {
    fetch(`/file/${filename}`)
      .then(response => response.text())
      .then(data => {
        if (editor) {
          editor.value(data);
        }
        highlightSelectedFile(filename);
        setSelectedFile(filename);
      });
  };

  const highlightSelectedFile = (filename) => {
    document.querySelectorAll('#fileList li').forEach(item => {
      if (item.textContent === filename) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  };

  const save = () => {
    if (!selectedFile) {
      alert('Bitte wählen Sie eine Datei zum Speichern aus.');
      return;
    }
    const markdownData = editor.value();
    fetch('/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: selectedFile, data: markdownData }),
    })
      .then(response => {
        if (response.ok) {
          alert('Datei erfolgreich gespeichert.');
        } else {
          throw new Error('Speichern fehlgeschlagen.');
        }
      })
      .catch(error => alert('Fehler beim Speichern der Datei: ' + error.message));
  };

  const confirmUpload = () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      fetch('/upload', {
        method: 'POST',
        body: formData,
      })
        .then(response => {
          if (response.ok) {
            alert('Datei erfolgreich hochgeladen.');
            refreshFileList();
          } else {
            throw new Error('Hochladen fehlgeschlagen.');
          }
        })
        .catch(error => alert('Fehler beim Hochladen der Datei: ' + error.message));
    }
  };

  const createFile = (event) => {
    event.preventDefault();
    if (newFilename.trim() === '') {
      alert('Bitte geben Sie einen Dateinamen ein.');
      return;
    }

    fetch('/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: newFilename }),
    })
      .then(response => {
        if (response.ok) {
          alert('Neue .md Datei erfolgreich erstellt.');
          refreshFileList();
        } else {
          throw new Error('Erstellen fehlgeschlagen.');
        }
      })
      .catch(error => alert('Fehler beim Erstellen der Datei: ' + error.message))
      .finally(() => setNewFilename(''));
  };

  // Check if the user has permission to view this page
  if (!userInfo.email || (userInfo.userGroup !== 'Editor' && userInfo.userGroup !== 'Admin')) {
    return <Redirect to={'/login'} />;
  }

  return (
    <div>
      <div className="container">
        <div className="sidebar">
          <div className="file-list">
            <input
              type="text"
              id="fileSearch"
              placeholder="Datei durchsuchen..."
              value={fileSearch}
              onChange={e => setFileSearch(e.target.value)}
            />
            <ul id="fileList">
              {fileList.map(file => (
                <li key={file.name} onClick={() => loadFile(file.name)}>
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
          <form
            id="uploadForm"
            onSubmit={e => e.preventDefault()}
          >
            <input
              type="file"
              name="file"
              id="fileInput"
              style={{ display: 'none' }}
              onChange={confirmUpload}
            />
            <label
              htmlFor="fileInput"
              className="file-input-label"
            >
              Datei hochladen
            </label>
          </form>
          <form
            id="createForm"
            onSubmit={createFile}
          >
            <button
              type="submit"
              className="button-primary"
            >
              .md Datei erstellen
            </button>
            <input
              type="text"
              name="newFilename"
              id="newFilenameInput"
              placeholder="Dateiname eingeben"
              value={newFilename}
              onChange={e => setNewFilename(e.target.value)}
            />
          </form>
        </div>
        <div className="editor-pane">
          <textarea id="editor"></textarea>
          <div className="button-group">
            <button
              onClick={save}
              className="button-primary"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Home;
