# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## Historial de versiones

Este archivo es la fuente oficial de verdad para las versiones publicadas. Para consultar el contexto del proceso interno y el progreso detallado de cada sprint, consulta el [historial de sprints](docs/historial-sprints/). Esos documentos complementan este changelog, pero no sustituyen el registro de versiones mantenido aquí.

## [Unreleased]

### Added

- Added numerical regression and curve fitting modules.
- Added tree-shaking optimizations for modern bundlers.
- Added Excel and Google Sheets integration examples.
- Added documentation for `calcularInversa` and `gaussLegendre`.
- Added finite difference methods.
- Added new methods incorporated during the current sprint.
- Added examples and documentation for newly implemented functionality.

### Changed

- Migrated legacy ESLint configuration to flat config.
- Clarified naming conventions (kebab-case) for new source files.
- Consolidated duplicated directories into a unified project structure.
- Updated project organization to reflect the directory consolidation.

### Fixed

- Fixed missing export in `gaussLegendre` and trapezoidal rule integration (#938).
- Fixed and cleaned up missing exports and alias issues in playground.
- Fixed function signatures and imports in Web Worker and React examples.
- Removed duplicate and orphaned files (`gauss_seidel.js`, `punto_fijo.js`, `trapezoidal.js`, and LU decomposition).
- Removed redundant `NumericalError.js` class.
- Converted legacy Python tests to Jest.
- Fixed test execution and compatibility issues in the JavaScript testing environment.

## [0.1.0] - 2026-04-19

### Added

- Initial ChuspaNumeric project setup.
- Repository creation.