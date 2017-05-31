
# Metasfresh Front-end Application
[![Join the chat at https://gitter.im/metasfresh/metasfresh](https://badges.gitter.im/metasfresh/metasfresh.svg)](https://gitter.im/metasfresh/metasfresh?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Krihelimeter](http://krihelinator.xyz/badge/metasfresh/metasfresh-webui-frontend)](http://krihelinator.xyz)

---
## Init
- Install dependencies
> npm install


- Create config. In that case run:
> cp src/config.js.dist src/config.js

## Dev environment
- First make sure you have installed all of dependencies by:
> npm install

- Then remember of creating config:
> cp /config.js.dist /config.js

- Then you should run node server by:
> npm start

# Build
In case of static version building execute (you are going need Webpack installed globally):
> webpack --config webpack.prod.js

And after that we need `config.js` in `dist` folder
> cp /config.js.dist /dist/

## Contribution

Remember to ensure before contribution that your IDE supports `.editorconfig` file,
and if needed fix your file before commit changes.

Also remember to respect our code-schema rules. All of them are listed in __eslint__ and __stylelint__ config files. To use them, just run:
> npm run-script lint
> 
> npm run-script stylelint

(first one is also autofixing when possible)

### Notice: CI/CD legacy

Submodule meta-frontend-ansible.git and .gitlab-ci.yml file are legacy of CI/CD.

### Dictionary

Project has a generic structure. Name of components and their containers should be strictly defined and keep for better understanding.

__MasterWindow__ - (e.g. `/window/143/1000000`) It is container for displaying single document view.

__DocList__ - (e.g. `/window/143/`) It's a view with a list of documents kept in table.

__DocumentList__ - It is a component that combining table for documents, filters, selection attributes, etc...

__Window__ - It is a component that is generating set of sections, columns, element's groups, element's lines and widgets (these are defined by backend layout)

__Widget__ - (__MasterWidget__, __RawWidget__) It is a component for getting user input.

__Header__ - It is a top navbar with logo.

__Subheader__ - It is a part of __Header__ and is toggled by *button with a home icon*.

__Sidelist__ - Toggled by *button with hamburger menu icon* in __Header__. It is collapsing panel situated on right side of 'browser window'.

__MenuOverlay__ - These are components that float over __Header__ and contain navigation links, triggered from breadcrumb.

__SelectionAttributes__ - It is a panel that might contain __Widgets__ and it is a side by side table in __DocumentList__.

### Schema
- MasterWindow
    - Container
    - Window
- DocList
    - Container
    - DocumentList
---
- Container
    - Header
    - Modal
    - RawModal
- Window
    - Widget
    - Tabs
- DocumentList
    - Table
    - Filters
    - SelectionAttributes
---
- Header
    - Subheader
    - Sidelist
    - Breadcrumb
        - MenuOverlay
- Modal
    - Window
    - Process
- RawModal
    - DocumentList
