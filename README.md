# Changeset Fetcher

A sfdx plugin to fetch changeset details from salesforce sandbox

## Getting Started

These installation instructions will get you started using the plugin on your local machine.

### Prerequisites

sfdx should be installed on your local machine. see following link for sfdx installation.
```
https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm
```

### Installing

Plugin can be installed in following ways: 
* plugins install
* cloning and plugins link
* cloning and run command

#### Plugins install

```
sfdx plugins:install @ngrx/changesetfetcher
```

#### cloning and plugins link
```
git clone https://github.com/ngfrx/changset-fetcher.git
sfdx plugins:link changsetfetcher
```

#### cloning and run command
```
git clone https://github.com/ngfrx/changset-fetcher.git
./bin/run ngfrx:changeset:list -u <username> --verbose
```

### Examples
```
sfdx ngfrx:changeset:list --username mysandboxusername@example.com
NAME                                        STATUS
──────────────────────────────────────────  ──────
JIRA-1234_HELLO_WORLD_SPRINT3               Open
```
```
sfdx ngfrx:changeset:list --username mysandboxusername@example.com --verbose
ID               NAME                                        DESCRIPTION  STATUS  MODIFIED BY     MODIFIED DATE
───────────────  ──────────────────────────────────────────  ───────────  ──────  ──────────────  ───────────────
0A20E0000009BJA  JIRA-1234_HELLO_WORLD_SPRINT3                            Open    Olivia White    22-1-2020 17:02
```

```
sfdx ngfrx:changeset:list --username mysandboxusername@example.com --list
{
  "status": 0,
  "result": {
    "recordCount": 1,
    "records": [
      {
        "id": "0A20E0000009BJA",
        "name": "JIRA-1234_HELLO_WORLD_SPRINT3",
        "description": "",
        "status": "Open",
        "modifiedBy": "Olivia White",
        "modifiedDate": "22-1-2020 17:02"
      }
    ]
  }
}
```






## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
