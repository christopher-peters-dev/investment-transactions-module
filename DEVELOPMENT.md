# Transactions feature development

Interactive UI development runs through the complete native brownfield app. This repository owns feature entities, use cases, data, view-models and screens; it does not own an RN runtime or AppRegistry. Its package and platform peers remain unchanged.


## Daily Feature Development

One-time setup: install Node >=22.11, JDK 17 and the Android SDK; run npm ci once in the RN host, Transactions repository, and native react-native-host consumer. Keep the three folders beside each other with artifacts/ at workspace level. Feature node_modules supports tests; Metro never uses its runtime copies.

Start the existing Pixel_8 emulator from Android Studio Device Manager, or in PowerShell:

~~~powershell
$androidSdk = Join-Path $env:LOCALAPPDATA 'Android/Sdk'
Start-Process (Join-Path $androidSdk 'emulator/emulator.exe') -ArgumentList '-avd','Pixel_8' -WindowStyle Hidden
& (Join-Path $androidSdk 'platform-tools/adb.exe') devices
~~~

Wait until adb lists the emulator as device (not offline). If the emulator is already running, reuse it.

Terminal 1:

~~~powershell
cd C:\Users\Chris\learn\workspace\InvestmentReactNativeHost
npm.cmd run dev
~~~

Terminal 2:

~~~powershell
cd C:\Users\Chris\learn\workspace\InvestmentBrownFieldPOC
.\scripts\start-brownfield-dev.ps1
~~~

With several devices, add -DeviceSerial emulator-5554 (replace with the desired adb serial).

In **Dummy Investments Dev**, observe native splash, log in with the prefilled dummy credentials, then tap **View Transactions** on the native portfolio. Edit the title in InvestmentTransactionsModule/src/presentation/screens/TransactionsScreen.tsx from Transaction History to My Transaction History and save. The running RN screen refreshes without an Android build, APK reinstall, npm pack, or host artifact rebuild. Restore the title after experimenting. Android Back returns to the native portfolio; Manage Investments opens the other RN root through the same ReactHost.

Optional Terminal 3:

~~~powershell
cd C:\Users\Chris\learn\workspace\InvestmentTransactionsModule
npm.cmd run test:watch
~~~

Use npm run dev:check for typecheck, lint, architecture boundaries and unit tests. Typechecks/tests continue exercising pinned package contracts; Metro UI development resolves the local platform implementation.

The launch script can start Metro if Terminal 1 is omitted. It prints the supervisor PID and stdout/stderr paths under native .verification/dev/. Stop that supervisor's process tree with taskkill /PID <printed-pid> /T /F before starting a new server. For foreground npm run dev, use Ctrl+C. Then npm run dev:reset restarts with a cleared Metro cache. The launch script refuses an unrelated server on port 8081.

The native launch script runs an incremental development assembly. It compares the APK hash and device install timestamp, skips unchanged installs, and launches MainActivity. During source editing, leave the app and Metro running; do not rerun the launch script for each save.

## Before PR / Integration

Use fresh immutable versions only when integrating feature changes. The commands below are examples of the next release after the existing Transactions 1.0.0 / host 1.1.0 artifacts; never overwrite an existing .tgz. Development mode does not run them or change artifact dependencies.

~~~powershell
cd C:\Users\Chris\learn\workspace\InvestmentTransactionsModule
npm.cmd run dev:check
npm.cmd run package:module -- 1.0.1

cd ..\InvestmentReactNativeHost
npm.cmd install --save-exact ../artifacts/company-investment-transactions-1.0.1.tgz
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run check:boundaries
npm.cmd run check:exports
npm.cmd run check:dependencies
npm.cmd test -- --runInBand
npm.cmd run package:host -- 1.1.1

cd ..\InvestmentBrownFieldPOC
.\gradlew.bat --stop
cd react-native-host
npm.cmd install --save-exact ../../artifacts/company-investment-rn-host-1.1.1.tgz
cd ..
.\scripts\build-from-artifact.ps1 -BuildType Debug
.\gradlew.bat :app:connectedDebugAndroidTest
~~~

Stop Metro before the packaged emulator regression to prove offline behavior. Run strict npm ci and artifact build checks in an isolated short-path checkout; do not substitute npm install for CI. Commit intended artifact dependency/lock changes during integration, never merely to work around a local file lock. Platform source changes require their own versioned platform artifact first; update feature peer contracts/version only when compatibility changes, then install that platform artifact in the host before packaging.

## Refresh and rebuild rules

| Change | Action |
| --- | --- |
| Feature or design-system TSX component | Save; Fast Refresh normally preserves compatible component state |
| Domain/use case or view-model TS | Save; Metro reevaluates dependants. Existing class instances can retain old behavior; use Metro r/dev-menu Reload when needed |
| Host JS navigation | Fast Refresh or JS reload; navigation can reset |
| Hook signature or component identity | Fast Refresh can remount/reset state |
| JS-only npm dependency | npm install in host, restart Metro, rerun development checks |
| Native RN dependency or its version | Align host/native consumer versions, install dependencies, rebuild development APK/autolinking |
| Kotlin, manifest, Gradle | Rebuild with start-brownfield-dev.ps1 |
| AppRegistry root name | Reload JS; rebuild native if the native CTA root name changes |
| Production artifact update | Version/package feature, install in host, package host, install in native consumer, run artifact build |

Fast Refresh state preservation is conditional, not a guarantee. A JS reload resets RN state; native splash/login/portfolio remain native. Restarting the Android process starts the normal native journey again.

## Windows troubleshooting

- Do not clean-reinstall node_modules during routine TS/TSX edits. For EBUSY during an intentional reinstall, close IDE dependency explorers/Java language servers, stop Gradle with gradlew.bat --stop, and stop Metro before retrying. No lockfile replacement is needed.
- Device Guard may block build-time hermesc.exe. Metro serves source JS to the existing Hermes runtime. Artifact mode retains its existing source-bundle default; no Windows security settings are changed.
- Use a short temporary checkout path for native CI to avoid Ninja's Windows path-length limit.
- A device must be authorized and ready. Use adb devices, reconnect, then rerun the launcher so adb reverse is restored.
- If Metro is stopped, the development RN journey fails visibly rather than silently falling back to an old embedded bundle. Start npm run dev, then reload RN.
- Existing RN/AGP deprecation warnings remain; dependency upgrades are outside this additive change.

Do not run Gradle cleanup commands concurrently with active builds: the artifact CI script runs gradlew --stop before npm ci, which can stop another local build daemon. Run developer startup and CI restore/build checks sequentially.
