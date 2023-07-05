# Apc Customize UI++ Extension README

The Successor of iocave/Customize UI

![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/drcika.apc-extension?color=blue) ![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/drcika.apc-extension?color=yellow) ![Visual Studio Marketplace Version (including pre-releases)](https://img.shields.io/visual-studio-marketplace/v/drcika.apc-extension?label=latest%20Version&&color=dark-green) ![License](https://img.shields.io/github/license/drcika/apc-extension?color=red) ![Stargazers](https://img.shields.io/github/stars/drcika/apc-extension?style=social)


## Overview
This extension allows customization outside vscode scoop.

Unlike its predecessor, it does not come with default settings, allowing you complete control over customization.

Feel free to explore my personal settings for inspiration: [View Settings](https://github.com/drcika/apc-extension/blob/production/demo/settings.json)

## Usage Instructions

Follow these steps to make the most of the Apc Customize UI++ extension:
  - Disable similar extensions.
  - Install/enable Apc Customize UI++ (It should be automatically enabled upon the first installation).
  - Open your `User settings.json` file in Visual Studio Code.
  - Add the provided configurations below to your settings.json file.
  - Unleash your creativity.

## Enabling and Disabling

To enable or disable this extension, follow these steps:
  1. Open Visual Studio Code.
  2. Go to the Command Palette by pressing `Cmd+Shift+P` on Mac or `Ctrl+Shift+P` on Windows.
  3. Type "Enable Apc extension" and enter to enable the extension.
  4. Conversely, type "Disable Apc extension" and enter to disable the extension.
  
## Supported Configuration Options

### `font.family`
> **Install the desired font on your computer**

Provided by vscode
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

Replace the Default Font Family for `extension-editor` (Requires Restart)

```jsonc
  "apc.font.family": "Roboto Mono",
  "apc.monospace.font.family": "Roboto Mono",
```

Replace the Default Font Family for Each Part Individually

```jsonc
  "apc.parts.font.family": {
    "sidebar": "Roboto Mono",
    "titlebar": "Roboto Mono",
    "activityBar": "Roboto Mono",
    "panel": "Roboto Mono",
    "tabs": "Roboto Mono",
    "statusbar": "Roboto Mono",
    "settings-body": "Roboto Mono",
    "extension-editor": "Roboto Mono", // require the font to be installed on the computer and the applications to be restarted
    "monaco-menu": "Roboto Mono"
  },
```

### `apc.imports`

> **Real-time monitoring of CSS files, no need to restart the application**
```jsonc
    "apc.imports": [ 
      "/Users/some/path/style.css",
      "/Users/some/path/script.js",
      "/C:/Users/path/style.css", // windows
      // or
      // see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link
      // local file imported like this is not watched in real time
      {
        "rel": "stylesheet",
        "href": "https://fonts.googleapis.com/css?family=Sofia"
      },
      // or
      // see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
      {
        "async":"async",
        "type":"text/javascript", 
        "src": "https://some/path.js"
      }
    ]
```

### `apc.iframe.style`
Inject Custom CSS into iFrame (Notebook, Extension view, etc)

> **Tab must be reopened for changes to take effect**
### 🚩 Limitation: if a tab with an iframe is open when starting vscode, the tab needs to be reopened for the styles to apply

```jsonc
  "apc.iframe.style": "/Users/path/style.css",
  "apc.iframe.style": "C:\\Users\\path\\style.css", // windows
  //
  "apc.iframe.style": {
    "h1": "color: red; font-size: 2rem;"
  }
  //
  "apc.iframe.style": {
    "h1": {
      "color": "red",
      "font-size": "2rem;"
      }
  }
```

### `apc.stylesheet`

```jsonc
    "apc.stylesheet": {
      ".monaco-workbench .part.editor>.content .editor-group-container>.title div.tabs-container": "border-radius: 5px; font-family: 'Times New Roman', Times, serif;"
      // or
      "body": {
        // other panels should be transparent see "workbench.colorCustomizations"
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

### `apc.activityBar`

```jsonc
    "apc.activityBar": {
      "position": "bottom" | "top" | undefined (regular) // activity bar will be positioned below/above the sidebar
      "size": number // if position set to bottom  this is the heigth else width of activity bar
    }
```

### `apc.statusBar`

```jsonc
    "apc.statusBar": {
      "position": "top" | "bottom" | "editor-top" | "editor-bottom",
      "height": number,
      "fontSize": number
    }
```

### `apc.electron`

For detailed information on the `apc.electron` configuration option, refer to the [Electron BrowserWindow documentation](https://www.electronjs.org/docs/latest/api/browser-window#new-browserwindowoptions).

Note that, when using the `vibrancy` option, other panels must also be transparent. You can check out a demo of this configuration [vibrancy.settings](https://github.com/drcika/apc-extension/blob/production/demo/vibrancy.settings.json).

# ⚠️Disclaimer

This extension is specifically designed for configuring Electron and Visual Studio Code.

I haven't developed anything or provided support for potential bugs.
My role is solely to provide a bridge for configuring Electron/VS Code.

For detailed information on available configurations, refer to [Electron BrowserWindow Options](https://www.electronjs.org/docs/latest/api/browser-window#new-browserwindowoptions).

### 🚩Exercise caution with the "apc.electron" configuration. Incorrect parameters may disrupt the proper startup of VSCode or VSCodium.

```jsonc
    // requires other panels to be transparent
    // see demo https://github.com/drcika/apc-extension/blob/production/demo/vibrancy.settings.json
    "apc.electron": {
      "vibrancy": "ultra-dark"
    }
    
    // or
    "apc.electron": {
      "backgroundColor": "rgba(123, 123, 123, 0.5)",
      "frame": false,
      "transparent": true,
      "titleBarStyle": "hiddenInset",
      "vibrancy": "ultra-dark",
      "opacity": 0.98, // range 0-1 if value 0 full transparent and you won't see 
      "visualEffectState": "active"
    }
    // or
    "apc.electron": {
      "frame": false,
    }
    // or
    "apc.electron": {
      "titleBarStyle": "hidden", // inline titleBar
    }
    // or
    "apc.electron": {
      "titleBarStyle": "hiddenInset", // inline titleBar
      "trafficLightPosition": { // custom position
        "x": 7,
        "y": 5
      }
    }
    // or 
    "apc.electron": {
      "titleBarStyle": "hidden",
      "titleBarOverlay": {
        "color": "#2f3241",
        "symbolColor": "#74b1be",
        "height": 60
      }
    }
```

### `apc.header`

```jsonc
    "apc.header": {
      "height": number,
      "fontSize": number
    }
```

### `apc.sidebar.titlebar`

```jsonc
    "apc.sidebar.titlebar": {
      "height": number,
      "fontSize": number
    }
```

### `apc.listRow`

```jsonc
    "apc.listRow": {
      "height": number,
      "fontSize": number
    }
```

### `apc.menubar.compact`

```jsonc
    // Enables compact menu bar
    "apc.menubar.compact": true
```

<div style="text-align:center">
  <img src="https://raw.githubusercontent.com/drcika/apc-extension/production/demo.png" alt="Demo"/>
</div>

## Acknowledgements

Inspired by
-   [iocave/monkey-patch](https://github.com/iocave/monkey-patch)
-   [iocave/customize-ui](https://github.com/iocave/customize-ui)
