# InvestmentTransactionsModule

Independent source-distributed npm feature @company/investment-transactions 1.0.0.
This project has no Android/iOS launcher, AppRegistry, Metro entry or private RN runtime.
The host owns navigation and shared platform services. It consumes this project's npm artifact, not sibling source.

## Develop and check

From this project in Windows PowerShell:

    npm.cmd ci
    npm.cmd run build
    npm.cmd run lint
    npm.cmd run check:boundaries
    npm.cmd test
    npm.cmd run package:module -- 1.0.0

Packaging refuses existing versions. For changes, bump package.json version, then run
npm.cmd run package:module -- 1.0.1. Output: ../artifacts/company-investment-transactions-1.0.1.tgz and .sha256.
Source TS/TSX files are the type declarations and runtime source; tsc validates them and host Metro compiles them.
No feature-only runtime bundle is generated.

## Public API

Import only from @company/investment-transactions:

- TransactionsScreen: viewModel + onSelectTransaction(id).
- TransactionDetailsScreen: viewModel + transactionId + onBack + onViewInvestment.
- registerTransactionsModule(container, optional {mockMode, delayMs}).
- transactionsTokens: host resolves viewModel; other tokens support typed feature registration.
- Types TransactionsViewModel, Transaction, TransactionFilter.

The host supplies one Logger via sharedTokens.logger before registration. Feature DI
creates data source, repository, both use cases, and a view-model factory. It does not create an app container.
Screens observe useSyncExternalStore through hooks. A 600ms mock source simulates async work.
Details load by ID via the second use case. Filtering and totals live in domain functions.
View Investment invokes a host callback which shows a placeholder alert.

## Shared dependencies

Peers: react 19.2.3, react-native 0.87.1, @company/investment-platform 1.0.1.
Versions were read from the host. Dev dependencies supply these for independent checks;
they are excluded from the runtime tarball. The platform provides the existing design system,
DI and Logger/Result/Error contracts through four public exports. No deep host imports are used.

## Host installation

From ../InvestmentReactNativeHost:

    npm.cmd install --save-exact @company/investment-transactions@file:../artifacts/company-investment-transactions-1.0.0.tgz
    npm.cmd run typecheck
    npm.cmd run package:host -- 1.1.0

The host's package lock records tarball integrity. Later use npm ci. Every updated feature
version requires a new aggregate host artifact and a native APK rebuild.

## Demo data

The four requested transactions span Aug–Oct 2026. Summary deliberately says Activity summary,
not This Month: ₹45,500 invested (including the pending ₹8,000) and ₹15,000 withdrawn cover ALL supplied dates.
Filters All / Investments / Withdrawals and details retain the selected filter on Back.
Loading, empty, error/retry, and success are available; set mockMode in host bootstrap to inspect demos.
There is no API, auth, Redux, real transaction or Artifactory connection.


## Full brownfield Metro development

See [the development guide](DEVELOPMENT.md) for the separate Dummy Investments Dev app, local-source Fast Refresh, and the daily/integration workflows. Artifact dependencies and packaged builds remain unchanged.
