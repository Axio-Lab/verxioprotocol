# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

- Add more granular changelog entries for future releases here.

## [0.1.3] - 2024-06-01

### Added

- Instruction-based functions for advanced transaction composition (all major operations now have `*Instruction` variants returning TransactionBuilder objects).
- Direct messaging and broadcast features for loyalty programs and pass holders, including message read status and analytics.
- Voucher management improvements: full lifecycle (create, mint, validate, redeem, extend, cancel), merchant ID system, analytics, and flexible metadata/image handling.
- Update authority support for loyalty programs and passes, allowing more granular control over updates and management.
- Support for multiple voucher types: percentage off, fixed credits, free item, BOGO, custom reward.
- Comprehensive test suite for all major features and edge cases.
- Irys integration for automatic NFT image and metadata uploads.

### Changed

- Refactored core modules for modularity and maintainability (e.g., extracted create-loyalty-program, issue-loyalty-pass, award/revoke points, voucher management, etc.).
- Improved error handling and validation across all major functions.
- Updated documentation and code examples to reflect new features and best practices.
- Updated internal module structure to use path aliases for better organization.
- Switched build process to Vite for faster builds and better DX.

### Fixed

- Various bug fixes in voucher expiry, redemption, and validation logic.
- Improved test coverage and reliability for all protocol operations.

## [1.0.0] - 2024-06-01

### Added

- Initial public release of Verxio Protocol SDK.
- Core loyalty program management.
- Messaging and broadcast features.
- Full test suite and documentation.
