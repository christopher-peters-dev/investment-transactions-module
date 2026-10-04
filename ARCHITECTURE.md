# Transactions architecture

1. Domain: immutable Transaction, repository interface, filtering/totals and two use cases. No React/RN/data dependencies.
2. Data: DTO, validating mapper, remote source contract, delayed mock source, repository implementation. Failures become Result/AppError.
3. Presentation: cards/badge, two screens, hooks and view model. Components neither create repositories nor call transports.
4. Dependency inversion: use cases know TransactionRepository, not its implementation. Logger and Result are shared contracts.
5. DI: registerTransactionsModule binds feature source -> repository -> use cases -> view-model factory in the host-owned Container.
6. Platform: @company/investment-platform is a peer; four public exports enforce stable boundaries. No copied platform or deep host imports.
7. Design system: AppScreen/Text/Card/Button/Header/Divider and tokens are the SAME implementation used by Manage Investments.
8. Observability: host supplies Logger. Repository errors, use-case failures, view-model failures and initialization use it. No UI console calls.
9. Package boundary: src/index.ts is the sole feature export. Only that entry can be consumed; internal classes are not public exports.
10. Local artifacts: workspace/artifacts simulates an immutable npm artifact repository; archives have SHA-256 companion files.
11. Host composition: installs the Transactions tarball, registers shared services then both features, and owns their navigation.
12. Native entry: View Transactions passes TransactionsExperience to the same internal ReactActivity used by Manage Investments.
13. Final delivery: standard npm bundledDependencies carries the installed feature and platform packages in the aggregate host archive. React/RN remain peers. Android consumes ONLY this aggregate host artifact. Gradle invokes Metro/Hermes to create one bundle; both roots share Application.reactHost.
14. Artifactory: change the host's local file dependency to version 1.0.0 and configure the @company scope in .npmrc to a private npm registry. CI tests and npm publishes the feature; host npm ci consumes pinned versions. Do not commit credentials. For self-contained delivery the host packager's local install/checksum input would change to pinned registry packages/lockfile integrity; composition, exports, DI, native entry and single runtime remain the same.

Screen -> hook/view model -> use case -> repository interface -> implementation -> mock source.
Details use GetTransactionByIdUseCase rather than directly accessing data.
Stale requests are invalidated on unmount/refresh. Filter calculations are pure domain functions.
Host navigation keeps the list mounted behind details, preserving loaded state/filter.

## Delivery diagram

```text
InvestmentTransactionsModule
        | npm pack
        v
workspace/artifacts
        |
        v
@company/investment-transactions.tgz
        |
        v
InvestmentReactNativeHost
        |
        +-------------------------------+
        |                               |
Manage Investments              Transactions
        |                               |
        +---------------+---------------+
                        |
                        v
                  AppRegistry
                /             \
ManageInvestmentsExperience   TransactionsExperience
                \             /
                 \           /
                    RN Host
                       |
                       v
                Host package
                       |
                       v
            InvestmentBrownFieldPOC
                       |
                       v
            React Native Gradle
                       |
                       v
                Metro bundle
                       |
                       v
                     APK
```

## Version and rebuild rules

| Change | Required action |
| --- | --- |
| Platform contracts, DI or design-system behavior | Bump platform semantic version; pack; update host and feature peer/dev compatibility; rebuild host and native app. Breaking public API requires a major version. |
| Transactions domain/data/UI or peer compatibility | Bump feature version; test/pack; host installs new tarball and lock; rebuild aggregate host and native app. |
| Host composition/navigation/registration or selected dependency versions | New aggregate host artifact version; update native dependency lock; rebuild APK. |
| Native CTA/lifecycle/UI only | Native rebuild; no platform or feature bump unless their code changed. |
| Documentation-only change excluded from runtime | No APK needed; a newly published package still gets a new immutable package version. |

Platform 1.0.0 was initial extraction scaffolding. 1.0.1 is the first consumed four-export contract.
Transactions starts at 1.0.0; aggregate host moves from 1.0.0 to 1.1.0.

## POC limits

Manage Investments remains local to the host; Transactions is independently packaged. Platform source is maintained in host/packages for now but versioned separately. Source distribution relies on TypeScript-aware Metro. exports plus TS fixtures/import scanning and Metro guards block unsupported paths (Metro alone can fall back). All mock dates are summarized as activity, not a misleading monthly total. Package independence does not mean runtime downloading or bundle independence. Only Android/x86_64 emulator checks are performed here; no production signing or iOS integration is added.

