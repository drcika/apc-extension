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

### `apc.imports`

***Css files are watched in real time, no need to restart the application***
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

see 

https://www.electronjs.org/docs/latest/api/browser-window#new-browserwindowoptions

*vibrancy requires other panels to be transparent*

see demo https://github.com/drcika/apc-extension/blob/production/demo/vibrancy.settings.json

# Disclaimer #

this extension only allows configuring electron / vscode 

I didn't develop anything or provide support for possible bugs

I'm just providing a bridge to configure electron / vscode

all possible configuration

https://www.electronjs.org/docs/latest/api/browser-window#new-browserwindowoptions

### be careful with the "apc.electron" configuration if you put not a valid parameter the vscode/vscodium won't start ###
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
    // "Enables compact menu bar on macos"
    "apc.menubar.compact": true
```

<div style="text-align:center">
  <img src="https://github.com/drcika/apc-extension/blob/production/demo.png"/>
</div>

## Credits

Inspired by

https://github.com/iocave/monkey-patch

https://github.com/iocave/customize-ui
