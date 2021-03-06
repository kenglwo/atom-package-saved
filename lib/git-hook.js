'use babel';

import GitHookView from './git-hook-view';
import { CompositeDisposable, BufferedProcess } from 'atom';
// import exec from 'child_process';
const childProcess = require('child_process');


let studentId, studentName, serverUrl, loginName;

class Authentication {
  constructor(obj) {
    this.obj = obj;
    this.studentId = obj.student_id;
    this.studentName = obj.student_name;
    this.url = obj.url;
    this.username = obj.username;
    this.password = obj.password;
  }

  serialize() {
    return {
      deserializer: 'Authentication',
      data: this.obj
    }
  }
}

callback = function (err, stdout, stderr) {
    if (err) {
        console.log(stderr)
    } else {
        console.log(stdout)
    }
    return
}

function createDiv(text, id) {
  div = document.createElement("div");
  div.setAttribute('style', 'margin-right:10px; margin-bottom: 10px;' +
                            'font-size: 15px; font-weight:bold;');
  div.appendChild(document.createTextNode(`${text} : `));

  input = document.createElement('input');
  input.setAttribute('id', id);
  input.setAttribute('style', 'width:350px');
    input.classList.add('native-key-bindings');
  div.appendChild(input);

  return div;

}

export default {

  gitHookView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.gitHookView = new GitHookView(state.gitHookViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.gitHookView.getElement(),
      visible: false
    });

    const cwd_path = atom.project.getPaths()
    // window.alert(cwd_path);
    // const platform = process.platform; // darwin, win32 or linux

    dialog = document.createElement("div");
    dialog.setAttribute('style', 'width:100%');

    divStudentId = createDiv("Student ID", "studentId");
    divStudentName = createDiv("Your Name", "studentName");
    divBlank = document.createElement("div")
    divBlank.setAttribute("style", "margin-bottom: 30px");

    dialog.appendChild(divStudentId);
    dialog.appendChild(divStudentName);
    dialog.appendChild(divBlank);

    div1 = createDiv("Login Name", "loginName");
    div2 = createDiv("Server URL", "serverUrl");

    dialog.appendChild(div1);
    dialog.appendChild(div2);

    submitButton = document.createElement("button");
    submitButton.textContent = "OK";
    submitButton.setAttribute('type', 'button');
    submitButton.setAttribute('style', 'width: 60px');
    dialog.appendChild(submitButton);

    panel = atom.workspace.addModalPanel({item: dialog});

    submitButton.addEventListener('click', (e) => {
      studentId = document.getElementById("studentId").value;
      studentName = document.getElementById("studentName").value;
      loginName = document.getElementById("loginName").value;
      serverUrl = document.getElementById("serverUrl").value;


      // obj = {
      //   student_id: studentId,
      //   student_name: studentName,
      //   url: url,
      //   username: username,
      //   password: password
      // }
      //
      // auth = new Authentication(obj)

      panel.destroy();
      return false
    });




    command_mac = `
      cd ${cwd_path};
      if !(type git > /dev/null 2>&1); then
        # gitをインストールする処理
        echo 'install git';
      else
        # gitがインストールされている場合
        if [ -e ./.git ]; then # cwdをgit管理している場合
          git add *;
          git commit -m "commit log";
        else #cwdをgit管理していない場合
          git init;
          git add *;
          git commit -m "initial commit";
        fi
      fi
    `;


//
    atom.workspace.observeTextEditors(editor => {
      let buffer = editor.getBuffer();
      buffer.onDidSave((event) => {
        // window.alert(cwd_path);
          childProcess.exec(command_mac, (error, stdout, stderr) => {
          if(error) return console.error('ERROR', error);
          window.alert(stdout);
          window.alert(stderr);
      });
      })
    })

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'git-hook:convert': () => this.convert(),
      'git-hook:onDidSave': () => this.onDidSave()
    }));
  },


  deactivate() {

    const path = atom.project.getPaths();
    // window.alert(path);

    command = `
      cd ${path};
      cp -r .git ${studentId}.git;
      sftp ${loginName}@${serverUrl} << EOF
      cd git
      put -r ${studentId}.git
      quit
      EOF
    `;


    window.alert(command);
    childProcess.execSync(command, (error, stdout, stderr) => {
      if(error) return window.alert(error);
      window.alert(stdout);
      window.alert(stderr);
    });

    command_final = `
      cd ${path};
      yes | rm -r ${studentId}.git;
    `
    childProcess.execSync(command_final, (error, stdout, stderr) => {
      if(error) return window.alert(error);
      window.alert(stdout);
      window.alert(stderr);
    });



    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.gitHookView.destroy();
  },

  serialize() {
    return {
      gitHookViewState: this.gitHookView.serialize()
    };
  },

  deserializeAuthentication({data}) {
    return new Authentication(data)
  },

  convert() {
    const editor = atom.workspace.getActiveTextEditor()
    if (editor) {
      const selection = editor.getSelectedText()

      const figlet = require('figlet')
      const font = 'o8'
      figlet(selection, {font}, function(error, art) {
        if (error) {
          console.error(error)
        } else {
          editor.insertText(`\n${art}\n`)
        }
      })
    }
  },

  onDidSave(){
    atom.workspace.observeTextEditors(editor => {
      let buffer = editor.getBuffer();
      buffer.onDidSave((event) => {
        window.alert("File Saved");
      })
    })
  }


};
