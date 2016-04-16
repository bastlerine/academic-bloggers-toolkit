import Dispatcher from './utils/Dispatcher';
import { parseInlineCitationString } from './utils/HelperFunctions';

declare var tinyMCE, ABT_locationInfo

tinyMCE.PluginManager.add('abt_main_menu', (editor, url: string) => {

  //==================================================
  //                 MAIN BUTTON
  //==================================================

  let ABT_Button: any = {
    id: 'abt_menubutton',
    type: 'menubutton',
    icon: 'abt_menu dashicons-welcome-learn-more',
    title: 'Academic Blogger\'s Toolkit',
    menu: [],
  };

  //==================================================
  //               BUTTON FUNCTIONS
  //==================================================

  let openInlineCitationWindow = () => {
      editor.windowManager.open(<TinyMCEWindowMangerObject>{
        title: 'Inline Citation',
        url: ABT_locationInfo.tinymceViewsURL + 'citation-window.html',
        width: 400,
        height: 85,
        onClose: (e) => {
          if (!e.target.params.data) { return; }
          editor.insertContent(
            '[cite num=&quot;' + parseInlineCitationString(e.target.params.data) + '&quot;]'
          );
        }
      });
    }

  let openFormattedReferenceWindow = () => {
    editor.windowManager.open(<TinyMCEWindowMangerObject>{
      title: 'Insert Formatted Reference',
      url: ABT_locationInfo.tinymceViewsURL + 'reference-window.html',
      width: 600,
      height: 10,
      params: {
        baseUrl: ABT_locationInfo.tinymceViewsURL,
        preferredStyle: ABT_locationInfo.preferredCitationStyle,
      },
      onclose: (e: any) => {

        // If the user presses the exit button, return.
        if (Object.keys(e.target.params).length === 0) {
          return;
        }

        editor.setProgressState(1);
        let payload: ReferenceFormData = e.target.params.data;
        let refparser = new Dispatcher(payload, editor);

        if (payload.addManually === true) {
          refparser.fromManualInput(payload);
          return;
        }

        refparser.fromPMID();
      },
    });
  };

  let generateSmartBib = function() {
    let dom: HTMLDocument = editor.dom.doc;
    let existingSmartBib: HTMLOListElement = <HTMLOListElement>dom.getElementById('abt-smart-bib');

    if (!existingSmartBib) {
      let smartBib: HTMLOListElement = <HTMLOListElement>dom.createElement('OL');
      let horizontalRule: HTMLHRElement = <HTMLHRElement>dom.createElement('HR');
      smartBib.id = 'abt-smart-bib';
      horizontalRule.className = 'abt_editor-only';
      let comment = dom.createComment(`Smart Bibliography Generated By Academic Blogger's Toolkit`);
      dom.body.appendChild(comment);
      dom.body.appendChild(horizontalRule);
      dom.body.appendChild(smartBib);
      this.state.set('disabled', true);
    }

    return;
  }


  //==================================================
  //                 MENU ITEMS
  //==================================================

  let separator: TinyMCEMenuItem = { text: '-' };


  let inlineCitation: TinyMCEMenuItem = {
    text: 'Inline Citation',
    onclick: openInlineCitationWindow,
  }
  editor.addShortcut('meta+alt+c', 'Insert Inline Citation', openInlineCitationWindow);


  let formattedReference: TinyMCEMenuItem = {
    text: 'Formatted Reference',
    onclick: openFormattedReferenceWindow,
  }
  editor.addShortcut('meta+alt+r', 'Insert Formatted Reference', openFormattedReferenceWindow);


  let smartBib: TinyMCEMenuItem = {
    text: 'Generate Smart Bibliography',
    id: 'smartbib',
    onclick: generateSmartBib,
    disabled: false,
  }


  let requestTools: TinyMCEMenuItem = {
    text: 'Request More Tools',
    onclick: () => {
      editor.windowManager.open({
        title: 'Request More Tools',
        body: [{
          type: 'container',
          html:
            `<div style="text-align: center;">` +
              `Have a feature or tool in mind that isn't available?<br>` +
              `<a ` +
              `href="https://github.com/dsifford/academic-bloggers-toolkit/issues" ` +
              `style="color: #00a0d2;" ` +
              `target="_blank">Open an issue</a> on the GitHub repository and let me know!` +
            `</div>`,
        }],
        buttons: [],
      });
    }
  }


  let keyboardShortcuts: TinyMCEMenuItem = {
    text: 'Keyboard Shortcuts',
    onclick: () => {
      editor.windowManager.open({
        title: 'Keyboard Shortcuts',
        url: ABT_locationInfo.tinymceViewsURL + 'keyboard-shortcuts.html',
        width: 400,
        height: 90,
      });
    }
  }

  // Workaround for checking to see if a smart bib exists.
  setTimeout(() => {
    let dom: HTMLDocument = editor.dom.doc;
    let existingSmartBib: HTMLOListElement = <HTMLOListElement>dom.getElementById('abt-smart-bib');
    if (existingSmartBib) {
      smartBib.disabled = true;
      smartBib.text = 'Smart Bibliography Generated!';
    }
  }, 500);

  ABT_Button.menu.push(smartBib, inlineCitation, formattedReference, separator, keyboardShortcuts, requestTools);

  editor.addButton('abt_main_menu', ABT_Button);



});


// Reference List Generator Button

tinyMCE.PluginManager.add('abt_generate_references', (editor, url: string) => {
  let Button: any = {
    id: 'abt_refgenerator',
    type: 'button',
    title: 'Generate Reference List',
    icon: 'abt_menu dashicons-admin-generic',
  };

  editor.addButton('abt_generate_references', Button);
});