# Apc Customize UI++ extension README

The successor of iocave/Customize UI

## What does it do

Allows customization outside vscode scoop.

The extension comes with no default settings.

It's all up to you

see my personal settings
https://github.com/drcika/apc-extension/blob/production/demo/settings.json

## Instructions

  - deactivate simular extensions
  - inastall/enable Apc Customize UI++ (Apc Customize UI++ it should be enabled after the first installation)
  - express your creativity

## Enabling and Disabling

VSCode commands:
* Enable Apc extension / apc.extension.enable
* Disable Apc extension / apc.extension.disable
  
## Supported configuration options

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
### `apc.css`

**Only VSCodium**

***vscode won't work (for now)***

```jsonc
    "apc.css": [ "/Users/aleksandarpopovic/.dotfiles/.vsCodeCustom/style.css" ]
    // Windows
    "apc.css": [ "C:\Users\path\style.css" ]
```

### `apc.activityBar`

```jsonc
    "apc.activityBar": {
      "position": "bottom" | "bottom" | undefined (regular) // activity bar will be positioned below/above the sidebar
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

see https://www.electronjs.org/docs/latest/tutorial/window-customization

```jsonc
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

<div style="text-align:center">
  <img src="https://github.com/drcika/apc-extension/blob/production/demo.png"/>
</div>

## Credits

Inspired by

https://github.com/iocave/monkey-patch

https://github.com/iocave/customize-ui
