# fuzzy-tester

`yarn setup` makes the application callable via CLI
`yarn start` runs the fuzzer for all scripts

## CLI commands

`noir-fuzzer` runs the fuzzer for all scripts
`noir-fuzzer --project PROJECT_NAME --(variable_name) VALUE ...` runs the fuzzer for one particular project - it uses the variables passed via flags

## To add further tests

- Add a project in `scripts/crates`
- Add the project to `scripts/Nargo.toml`
- Add a generator for your project to `src/baselines.js`
- Add the project name and generator to the PACKAGES array in `src/constants`
