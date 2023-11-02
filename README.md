<div align="center">

# Apc Customize UI++ Extension README

The Successor to iocave/Customize UI

![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/drcika.apc-extension?color=blue) ![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/drcika.apc-extension?color=yellow) ![Visual Studio Marketplace Version (including pre-releases)](https://img.shields.io/visual-studio-marketplace/v/drcika.apc-extension?label=latest%20Version&&color=dark-green) ![License](https://img.shields.io/github/license/drcika/apc-extension?color=red) ![GitHub Repo stars](https://img.shields.io/github/stars/drcika/apc-extension?style=social)

</div>

## Overview

This extension allows customization outside vscode scoop.

Unlike its predecessor, it ships with no default settings, granting you full customization control.

Explore my setup for inspiration: [View Settings](https://github.com/drcika/apc-extension/blob/production/demo/settings.json)

## Getting Started

  - Open Visual Studio Code
  - Disable similar extensions
  - Install this extension (auto-enabled on first install)
  - Customize by adding configurations to your `user settings.json`

<details>
<summary>💡 Troubleshooting Extension Issues!</summary>

#### Extension stopped functioning after an update

- To re-enable, go to the Command Palette and type `Enable Apc extension`

#### Windows Users

- **Single-user** installs: No admin rights required.
- **All-user** installs: Run VSCode or VSCodium in Administrator mode.

#### Mac and Linux Users

To ensure the extension works, allow VSCode or VSCodium to modify itself by fixing read-only code files and permission issues.

> **important**
> If you use a package manager, confirm the custom installation path before executing these commands.

#### macOS
  ```sh
  sudo chown -R $(whoami) $(which code)
  ```

#### Linux
  ```sh
  sudo chown -R $(whoami) /usr/share/code
  ```

#### Common Software Installation Paths
| Operating System       | Software        | Installation Path |
|------------------------|-----------------|-------------------|
| 🍎 **macOS**           | VSCode          | `/Applications/Visual Studio Code.app/Contents/Resources/app/out` |
|                        | VSCode Insiders | `/Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/out` |
|                        | VSCodium        | `/Applications/VSCodium.app/Contents/Resources/app/out` |
| 🐧 **Linux** (most distros) | VSCode | `/usr/share/code` |
| 🐧 **Arch Linux** (alternate) | VSCode | `/opt/visual-studio-code` |

</details>

## Enabling and Disabling

  - Open the Command Palette (Mac: <kbd>⌘</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>, Windows: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>)
  - Type `Enable Apc extension` to enable or `Disable Apc extension` to disable

## Disclaimer

This extension is experimental and tweaks certain VSCode / VSCodium files. <br>

> Proceed at your own risk

🚀 Disable to back up original files in case of issues. <br>
🔄 Auto-reapplies patches after each VSCode / VSCodium update. If not, re-enable it. <br>
🐞 Report bugs on our [GitHub repository](https://github.com/drcika/apc-extension/issues)

---

## Supported Configuration Options

### `apc.electron`

Configures the Electron window. For detailed info, see the [Electron BrowserWindow documentation](https://www.electronjs.org/docs/latest/api/browser-window#new-browserwindowoptions)

> **Warning**
> Incorrect "apc.electron" configuration can disrupt VSCode or VSCodium startup.

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
    "apc.electron": {
      "titleBarStyle": "hidden",
    },
    "window.titleBarStyle": "native"
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

<details>
<summary><b>custom title bar</b></summary>

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
</details>

<details>
<summary><b>vibrancy setting</b></summary>

```jsonc
    // To utilize the `vibrancy` option, ensure other panels are transparent.
    // Demo: https://github.com/drcika/apc-extension/blob/production/demo/vibrancy.settings.json
    "apc.electron": {
      "vibrancy": "ultra-dark"
    }
```
</details>

<details>
<summary><b>background color, transparency</b></summary>

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
</details>

> **Note** Multiple declarations of `apc.electron` will apply only the last declaration, ignoring previous ones.

### `font.family`

Customize font family for any part of VS Code

<details>
<summary>Defaults in vscode</summary>

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
</details>

To adjust font family for `extension-editor`, install the font on your computer and restart vscode.

```jsonc
  "apc.font.family": "Roboto Mono",
  "apc.monospace.font.family": "Roboto Mono",
```

Change default font family for individual sections

```jsonc
  "apc.parts.font.family": {
    "sidebar": "Roboto Mono",
    "titlebar": "Roboto Mono",
    "activityBar": "Roboto Mono",
    "panel": "Roboto Mono",
    "tabs": "Roboto Mono",
    "statusbar": "Roboto Mono",
    "settings-body": "Roboto Mono",
    "extension-editor": "Roboto Mono", // Install the font and restart vscode
    "monaco-menu": "Roboto Mono"
  },
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

### `apc.imports`

Customize VS Code's Look and Feel with Real-time CSS & JS Imports

```jsonc
    "apc.imports": [
      "/Users/some/path/style.css",
      "/Users/some/path/script.js",
      "/C:/Users/path/style.css", // Windows path
      "${userHome}/path/style.css", // Only supports ${userHome}

      // Local file imports like this are not watched in real time
      // Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link
      {
        "rel": "stylesheet",
        "href": "https://fonts.googleapis.com/css?family=Sofia"
      },

      // Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
      {
        "async":"async",
        "type":"text/javascript",
        "src": "https://some/path.js"
      }
    ]
```

### `apc.menubar.compact`

Move Menu bar to Activity bar for a compact design

```jsonc
    "apc.menubar.compact": true
```

### `apc.header`

Adjust the height and font size of the header bar

```jsonc
    "apc.header": {
      "default": number, // Applied with "window.density.editorTabHeight": "default"
      "compact": number, // Applied wtih "window.density.editorTabHeight": "compact"
      "height": number, // Applied when neither "default" nor "compact" is specified
      "fontSize": number
    }
```

### `apc.activityBar`

Set the position and dimensions of the activity bar

```jsonc
    "apc.activityBar": {
      "position": "bottom" | "top", // top: above sidebar, bottom: below sidebar (default: 'left' if unspecified)
      "size": number, // Height (when top/bottom) or width (in default position)
      "itemSize": number, // Size of items within the bar (default: size)
      "itemMargin": number // Margin between two items (default: 3)
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

### `apc.statusBar`

Set the position and height of the status bar

```jsonc
    "apc.statusBar": {
      "position": "top" | "bottom" | "editor-top" | "editor-bottom",
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

### `apc.iframe.style`

Apply custom CSS to iframes (Notebook, Extension view, etc)

> **important**
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

## ⚠️ Important Notice

This extension is your go-to tool for customizing Electron and Visual Studio Code.

I haven't developed anything nor provided support for potential bugs, but consider me your bridge to tailor Electron and VS Code just the way you like.

## Inspirations

  - [iocave/customize-ui](https://github.com/iocave/customize-ui)
  - [iocave/monkey-patch](https://github.com/iocave/monkey-patch)
