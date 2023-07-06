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
- Open Visual Studio Code.
- Go to the Command Palette by pressing `Cmd+Shift+P` on Mac or `Ctrl+Shift+P` on Windows.
- Type "Enable Apc extension" and enter to enable the extension.
- Conversely, type "Disable Apc extension" and enter to disable the extension.

## Supported Configuration Options

### `apc.electron`

Configures the Electron window

For detailed information on available configurations, refer to the [Electron BrowserWindow documentation](https://www.electronjs.org/docs/latest/api/browser-window#new-browserwindowoptions).


> **Feel free to pick a style you like or come up with your own!**

Here's what we covered:

- vibrancy setting
- background color, transparency
- title bar style (frameless, inline, traffic light position)
- custom title bar

### 🚩WARNING: Exercise caution with the "apc.electron" configuration. Incorrect parameters may disrupt the proper startup of VSCode or VSCodium.

```jsonc
    // For using the `vibrancy` option, other panels requires to be transparent.
    // check out a demo https://github.com/drcika/apc-extension/blob/production/demo/vibrancy.settings.json
    "apc.electron": {
      "vibrancy": "ultra-dark"
    }

    // customize visuals including background color, transparency, and title bar style
    "apc.electron": {
      "backgroundColor": "rgba(123, 123, 123, 0.5)",
      "frame": false,
      "transparent": true,
      "titleBarStyle": "hiddenInset",
      "vibrancy": "ultra-dark",
      "opacity": 0.98,  // Opacity range is 0-1 where 0 means full transparency. If set, you won't see the element.
      "visualEffectState": "active"
    }

    // disables the frame
    "apc.electron": {
      "frame": false,
    }

    // sets the title bar style to hidden (inline title bar)
    // requires "window.titleBarStyle": "native" to take effect
    "apc.electron": {
      "titleBarStyle": "hidden",
    }

    // sets the title bar style to hiddenInset (inline title bar) and defines a custom traffic light position
    "apc.electron": {
      "titleBarStyle": "hiddenInset",
      "trafficLightPosition": {
        "x": 7,
        "y": 5
      }
    }

    // sets the title bar style to hidden and adds a title bar overlay with custom color, symbol color, and height
    "apc.electron": {
      "titleBarStyle": "hidden",
      "titleBarOverlay": {
        "color": "#2f3241",
        "symbolColor": "#74b1be",
        "height": 60
      }
    }
```

### `font.family`

Change the default font family for (any part of) vscode

> **The desired font must be installed on your computer**

By default, Provided by vscode
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
    "extension-editor": "Roboto Mono", // requires the font to be installed on your computer and applications to be restarted
    "monaco-menu": "Roboto Mono"
  },
```

### `apc.imports`

Import CSS and JavaScript files to customize the look and feel of VS Code

> **Real-time monitoring of CSS files, no need to restart the application**
```jsonc
    "apc.imports": [
      "/Users/some/path/style.css",
      "/Users/some/path/script.js",
      "/C:/Users/path/style.css", // for windows

      // or see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link
      // local file imports like this are not watched in real time
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
        // other panels should be transparent. see "workbench.colorCustomizations"
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
      "height": number,
      "fontSize": number
    }
```

### `apc.activityBar`

Set the position and size of the activity bar
- `top`: above sidebar
- `bottom`: below sidebar
- Default position if not specified

```jsonc
    "apc.activityBar": {
      "position": "bottom" | "top",
      "size": number  // height when positioned at top/bottom, width in default position
    }
```

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
    "apc.listRow": {
      "height": number,
      "fontSize": number
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

### 🚩 Limitation: On vscode startup, if there is a tab open with an iframe, you will need to reopen that tab in order for the styles to be applied.

```jsonc
  "apc.iframe.style": "/Users/path/style.css",
  "apc.iframe.style": "C:\\Users\\path\\style.css", // windows

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
  <img src="https://raw.githubusercontent.com/drcika/apc-extension/production/demo.png" alt="Demo"/>
</div>

## ⚠️Disclaimer

This extension is specifically designed for configuring Electron and Visual Studio Code.

I haven't developed anything or provided support for potential bugs.
My role is solely to provide a bridge for configuring Electron/VS Code.

## Acknowledgements

Inspired by
-   [iocave/monkey-patch](https://github.com/iocave/monkey-patch)
-   [iocave/customize-ui](https://github.com/iocave/customize-ui)
