# Apc Customize UI++ Extension README

The Successor of iocave/Customize UI

![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/drcika.apc-extension?color=blue) ![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/drcika.apc-extension?color=yellow) ![Visual Studio Marketplace Version (including pre-releases)](https://img.shields.io/visual-studio-marketplace/v/drcika.apc-extension?label=latest%20Version&&color=dark-green) ![License](https://img.shields.io/github/license/drcika/apc-extension?color=red) ![Stargazers](https://img.shields.io/github/stars/drcika/apc-extension?style=social)

## Overview

This extension allows customization outside vscode scoop.

Unlike its predecessor, it does not come with default settings, allowing you complete control over customization.

Explore my personal settings for inspiration: [View Settings](https://github.com/drcika/apc-extension/blob/production/demo/settings.json)

## Usage Instructions

To use the Apc Customize UI++ extension:
  - Disable similar extensions.
  - Install/enable this extension. (Enabled automatically on the first install)
  - Add the configurations below to your `user settings.json` file in vscode.
  - Start customizing!

## Enabling and Disabling

To enable or disable this extension:
  - Open Visual Studio Code.
  - Go to the Command Palette by pressing <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> on Mac or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> on Windows.
  - Type "Enable Apc extension" to enable or "Disable Apc extension" to disable the extension.

### Windows Users

> Run VSCode / VSCodium in Administrator mode before enabling or disabling the extension.

### Mac and Linux Users

> The extension will NOT work if VSCode / VSCodium cannot modify itself for specific reasons.

 The possible reasons are:
  - Code files are read-only, such as on a read-only file system.
  - Code is not started with the necessary permissions to modify itself.

To fix this, you need to claim ownership of VSCode's installation directory.

For macOS, use the following command.
```sh
sudo chown -R $(whoami) $(which code)
```

For Linux, use this command instead.
```sh
sudo chown -R $(whoami) /usr/share/code
```

> **Note:** Mac and Linux package managers might have a customized installation path. <br>
> Double-check that your path is correct. 

In macOS, the typical paths are:
  - `/Applications/Visual Studio Code.app/Contents/Resources/app/out` for VSCode
  - `/Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/out` for VSCode Insiders
  - `/Applications/VSCodium.app/Contents/Resources/app/out` for VSCodium

In most Linux distributions, the typical path is `/usr/share/code`

On Arch Linux, the path can be:
  - `/usr/lib/code/`
  - `/opt/visual-studio-code`

## ⚠️Disclaimer

This extension modifies specific files of Visual Studio Code / VSCodium.
> **Use at your own risk**

If something goes wrong, the extension will create a backup of the original file. That's what the disable command is for.

The extension attempts to reapply patches with each VSCode / VSCodium update. If it doesn't happen automatically, try enabling the extension again.

Remember that this extension is still experimental, which means you may encounter some bugs while playing with it. Kindly report any bugs to the [Github repository's issues section](https://github.com/drcika/apc-extension/issues)

## Supported Configuration Options

### `apc.electron`

Configures the Electron window

For detailed information on available configurations, refer to the [Electron BrowserWindow documentation](https://www.electronjs.org/docs/latest/api/browser-window#new-browserwindowoptions)

> **Warning** <br>
> Be careful with the "apc.electron" configuration, as incorrect parameters may disrupt VSCode or VSCodium startup.

> **Note** <br>
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
    // Other panels must be transparent to use the `vibrancy` option
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
      "opacity": 0.98,  // Range: 0-1 (0 means full transparency). If set, you won't see the element.
      "visualEffectState": "active"
    }
```

> **Note** Multiple declarations of `apc.electron` will result in only the last declaration being applied, while the previous declarations are ignored.

### `font.family`

Change the default font family for (any part of) vscode

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

Replace the Default Font Family for `extension-editor`
> **Install the desired font on your computer. Restart required.**

```jsonc
  "apc.font.family": "Roboto Mono",
  "apc.monospace.font.family": "Roboto Mono",
```

Replace the Default Font Family for Each Part individually

```jsonc
  "apc.parts.font.family": {
    "sidebar": "Roboto Mono",
    "titlebar": "Roboto Mono",
    "activityBar": "Roboto Mono",
    "panel": "Roboto Mono",
    "tabs": "Roboto Mono",
    "statusbar": "Roboto Mono",
    "settings-body": "Roboto Mono",
    "extension-editor": "Roboto Mono", // Required: Expected font installation on machine and Application restart
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
        // Other panels should be transparent. see "workbench.colorCustomizations"
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
      "size": number  // height when positioned at top/bottom, width in the default position
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

> **Warning** <br>
> On vscode startup, if there is a tab open with an iframe, you will need to reopen that tab for the styles to be applied.

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
  <img src="https://raw.githubusercontent.com/drcika/apc-extension/production/demo.png" alt="Demo.png"/>
</div>

## ⚠️Important Notice

This extension is specifically designed for configuring Electron and Visual Studio Code.

I have not developed anything or provided support for potential bugs. My role is to provide a bridge for configuring Electron/VS Code.

## Acknowledgements

Inspired by
  - [iocave/customize-ui](https://github.com/iocave/customize-ui)
  - [iocave/monkey-patch](https://github.com/iocave/monkey-patch)
