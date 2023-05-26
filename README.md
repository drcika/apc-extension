# Apc Customize UI++ extension README

The successor of iocave/Customize UI

## Supported configuration options

### `apc.stylesheet`

```jsonc
    "apc.stylesheet": {
      ".monaco-workbench .part.editor>.content .editor-group-container>.title div.tabs-container": "border-radius: 5px; font-family: 'Times New Roman', Times, serif;"
      // or
      "body": {
        "background-image": "url(/Users/aleksandarpopovic/imgs/19.png), linear-gradient(to top,rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.2))",
        "background-size": "cover",
        "background-blend-mode": "multiply",
        "background-repeat": "no-repeat"
      }
    }
```

### `apc.activityBar`

```jsonc
    "apc.activityBar": {
      "position": "bottom" | undefined // activity bar will be positioned below the sidebar
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
