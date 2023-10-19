<div align="center">

# Apc Customize UI++ Extension README

The Successor to iocave/Customize UI

![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/drcika.apc-extension?color=blue) ![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/drcika.apc-extension?color=yellow) ![Visual Studio Marketplace Version (including pre-releases)](https://img.shields.io/visual-studio-marketplace/v/drcika.apc-extension?label=latest%20Version&&color=dark-green) ![License](https://img.shields.io/github/license/drcika/apc-extension?color=red) ![GitHub Repo stars](https://img.shields.io/github/stars/drcika/apc-extension?style=social)

</div>

## Overview

This extension allows customization outside vscode scoop.

Unlike its predecessor, it comes with no default settings, allowing you complete control over customization.

Explore my personal settings for inspiration: [View Settings](https://github.com/drcika/apc-extension/blob/production/demo/settings.json)

## Usage Instructions

To use the Apc Customize UI++ extension:

  - Disable similar extensions.
  - Install/enable this extension. (Auto-enabled on the first install)
  - Add the configurations below to your `user settings.json` file in vscode.
  - Start customizing!

## Enabling and Disabling

To enable or disable this extension:

  - Open Visual Studio Code.
  - Go to the Command Palette by pressing <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> on Mac or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> on Windows.
  - Type "Enable Apc extension" to enable or "Disable Apc extension" to disable the extension.

### Windows Users

Run VSCode or VSCodium in **Administrator mode** before enabling/disabling the extension.

### Mac and Linux Users

The extension won't work if VSCode or VSCodium cannot modify itself, possibly due to:

  - Code files set as read-only.
  - Incorrect permissions for self-modification.

To fix this, claim ownership of VSCode installation directory with these commands.

#### macOS
  ```sh
  sudo chown -R $(whoami) $(which code)
  ```

#### Linux
  ```sh
  sudo chown -R $(whoami) /usr/share/code
  ```

> **Note** Verify the custom installation path for your Mac or Linux package manager.

- macOS paths
  - VSCode: `/Applications/Visual Studio Code.app/Contents/Resources/app/out`
  - VSCode Insiders: `/Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/out`
  - VSCodium: `/Applications/VSCodium.app/Contents/Resources/app/out`

- Most Linux distributions path: `/usr/share/code`

- Arch Linux paths: `/usr/lib/code/` or  `/opt/visual-studio-code`

## ⚠️Disclaimer

This extension tweaks certain VSCode / VSCodium files.

> **Proceed at your own risk**

- Automatically reapply patches after each VSCode / VSCodium update. If it doesn't, re-enable it.
- When disabled, it creates a backup of the original files. 

Note that this extension is experimental, and you may encounter bugs. Report issues on our [GitHub repository](https://github.com/drcika/apc-extension/issues)

## Supported Configuration Options

### `apc.electron`

Configures the Electron window

For detailed configuration info, refer to [Electron BrowserWindow documentation](https://www.electronjs.org/docs/latest/api/browser-window#new-browserwindowoptions)

> **Warning**
> Be careful with the "apc.electron" configuration, as incorrect parameters may disrupt VSCode or VSCodium startup.

> **Note**
> Here's what we covered. Choose a style you like, or create your own!

#### frameless title bar
```jsonc
    "apc.electron": {
      "frame": false,
    }
```

#### inline title bar
```jsonc
    // requires "window.titleBarStyle": "native" to take effect
    "apc.electron": {
      "titleBarStyle": "hidden",
    }
```

#### inline title bar with traffic light position
```jsonc
    "apc.electron": {
      "titleBarStyle": "hiddenInset",
      "trafficLightPosition": {
        "x": 7,
        "y": 5
      }
    }
```

#### custom title bar
```jsonc
    "apc.electron": {
      "titleBarStyle": "hidden",
      "titleBarOverlay": {
        "color": "#2f3241",
        "symbolColor": "#74b1be",
        "height": 60
      }
    }
```

#### vibrancy setting
```jsonc
    // To utilize the `vibrancy` option, ensure other panels are transparent.
    // Demo: https://github.com/drcika/apc-extension/blob/production/demo/vibrancy.settings.json
    "apc.electron": {
      "vibrancy": "ultra-dark"
    }
```

#### background color, transparency
```jsonc
    "apc.electron": {
      "backgroundColor": "rgba(123, 123, 123, 0.5)",
      "frame": false,
      "transparent": true,
      "titleBarStyle": "hiddenInset",
      "vibrancy": "ultra-dark",
      "opacity": 0.98,  // Range: 0-1 (To go fully transparent, set it to 0)
      "visualEffectState": "active"
    }
```

> **Note** Multiple declarations of `apc.electron` will apply only the last declaration, ignoring previous ones.

### `font.family`

Change the default font family for any part of VSCode

Default in vscode

```jsonc
  "editor.fontFamily": "Roboto Mono",
  "editor.inlayHints.fontFamily": "Roboto Mono",
  "editor.codeLensFontFamily": "Roboto Mono",
  "terminal.integrated.fontFamily": "Roboto Mono",
  "scm.inputFontFamily": "Roboto Mono",
  "chat.editor.fontFamily": "Roboto Mono",
  "debug.console.fontFamily": "Roboto Mono",
  "notebook.output.fontFamily": "Roboto Mono",
  "markdown.preview.fontFamily": "Roboto Mono",
```

Customize font family for `extension-editor` only
> **Install the font on your computer and restart vscode**

```jsonc
  "apc.font.family": "Roboto Mono",
  "apc.monospace.font.family": "Roboto Mono",
```

Customize fonts for individual sections

```jsonc
  "apc.parts.font.family": {
    "sidebar": "Roboto Mono",
    "titlebar": "Roboto Mono",
    "activityBar": "Roboto Mono",
    "panel": "Roboto Mono",
    "tabs": "Roboto Mono",
    "statusbar": "Roboto Mono",
    "settings-body": "Roboto Mono",
    "extension-editor": "Roboto Mono", // Install the font on your computer and restart vscode
    "monaco-menu": "Roboto Mono"
  },
```

### `apc.imports`

Import CSS and JavaScript files to customize the look and feel of VS Code

> **Real-time monitoring of CSS files, No need to restart**

```jsonc
    "apc.imports": [
      "/Users/some/path/style.css",
      "/Users/some/path/script.js",
      "/C:/Users/path/style.css", // for Windows

      // or see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link
      // Local file imports like this are not watched in real time
      {
        "rel": "stylesheet",
        "href": "https://fonts.googleapis.com/css?family=Sofia"
      },

      // or see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
      {
        "async":"async",
        "type":"text/javascript",
        "src": "https://some/path.js"
      }
    ]
```

### `apc.stylesheet`

Override the default CSS of VS Code

```jsonc
    "apc.stylesheet": {
      ".monaco-workbench .part.editor>.content .editor-group-container>.title div.tabs-container": "border-radius: 5px; font-family: 'Times New Roman', Times, serif;"
      
      "body": {
        // Other panels have to be transparent for this. See "workbench.colorCustomizations"
        "background-image": "url(/Users/aleksandarpopovic/imgs/19.png), linear-gradient(to top,rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.2))",
        "background-size": "cover",
        "background-blend-mode": "multiply",
        "background-repeat": "no-repeat"
      },
      "workbench.colorCustomizations": {
        "sideBar.background": "#00000000", // transparent
        "editor.background": "#00000000"
      ...etc
   	  }
    }
```

### `apc.header`

Adjust the height and font size of the header bar

```jsonc
    "apc.header": {
      "default": number, // Applied when "window.density.editorTabHeight": "default"
      "compact": number, // Applied when "window.density.editorTabHeight": "compact"
      "height": number, // Applied when "default" or "compact" is not specified
      "fontSize": number
    }
```

### `apc.activityBar`

Set the position and dimensions of the activity bar

```jsonc
    "apc.activityBar": {
      "position": "bottom" | "top",
      "size": number,  // height when positioned at top/bottom, width in the default position
      "itemSize": number, // the size of the items within the bar, defaults to `size`
      "itemMargin": number // the margin between two items, defaults to `3` 
    }
```

Possible values for `apc.activityBar.position` are:

- `top`: above sidebar
- `bottom`: below sidebar
- If not specified, the default (left) position is used.

### `apc.sidebar.titlebar`

Define the height and font size of the sidebar title bar

```jsonc
    "apc.sidebar.titlebar": {
      "height": number,
      "fontSize": number
    }
```

### `apc.listRow`

Specify the height and font size of list rows

```jsonc
    // knownlistViews = ['customview-tree', 'tabs-list', 'results', 'open-editors', 'explorer-folders-view', 'tree', 'outline-tree', 'scm-view', 'debug-view-content', 'debug-breakpoints',
    // 'settings-toc-wrapper', 'settings-tree-container', 'quick-input-list', 'monaco-table', 'select-box-dropdown-list-container', 'extensions-list', 'notifications-list-container'];

    "apc.listRow": {
      "lists": ["explorer-folders-view", "results"], // dafault if height or fontSize are provided ['customview-tree', 'results', 'open-editors', 'explorer-folders-view', 'outline-tree', 'scm-view', 'debug-view-content', 'debug-breakpoints', 'tree']
      "height": number,
      "fontSize": number,
      // by individual list
      "parts" : {
        "extensions-list" : {
          "height": number,
          "fontSize": number,
        },
        "scm-view": {
          "height": number,
          "fontSize": number,
          "actionButton": number, // only for scm-view
          "input": number // only for scm-view
        }
      }
    },

    // if additional styling needed
    "stylesheet": {
      ".explorer-folders-view.custom-list-row .monaco-list-row": "font-weight: bold; color: red;"
    }
```

### `apc.menubar.compact`

Enable a compact menu bar by relocating the Menu Bar to the Activity Bar

```jsonc
    "apc.menubar.compact": true
```

### `apc.statusBar`

Set the position and height of the status bar

```jsonc
    "apc.statusBar": {
      "position": "top" | "bottom" | "editor-top" | "editor-bottom",
      "height": number,
      "fontSize": number
    }
```

### `apc.iframe.style`

Inject custom CSS into iframes (Notebook, Extension view, etc)

> **Warning**
> When you start VSCode and have a tab open with an iframe, you must reopen that tab for the styles to take effect.

```jsonc
  "apc.iframe.style": "/Users/path/style.css",
  "apc.iframe.style": "C:\\Users\\path\\style.css", // Windows

  "apc.iframe.style": {
    "h1": "color: red; font-size: 2rem;"
  }

  "apc.iframe.style": {
    "h1": {
      "color": "red",
      "font-size": "2rem;"
      }
  }
```

## Demo

<div style="text-align:center">
  <img src="https://raw.githubusercontent.com/drcika/apc-extension/production/demo.png" alt="demo.png"/>
</div>

## 🌟 Important Notice

This extension is your go-to tool for configuring Electron and Visual Studio Code.

I haven't developed anything nor provided support for potential bugs, but consider me your bridge to tailor Electron and VS Code just the way you like.

## Inspirations

  - [iocave/customize-ui](https://github.com/iocave/customize-ui)
  - [iocave/monkey-patch](https://github.com/iocave/monkey-patch)
