<h1 align="center">
  <br>
  n8n-nodes-onoffice
  <br>
</h1>

<p align="center">
	<img alt="NPM Version" src="https://img.shields.io/npm/v/n8n-nodes-onoffice">
	<img alt="GitHub License" src="https://img.shields.io/github/license/hansdoebel/n8n-nodes-onoffice">
	<img alt="NPM Downloads" src="https://img.shields.io/npm/dm/n8n-nodes-onoffice">
	<img alt="NPM Last Update" src="https://img.shields.io/npm/last-update/n8n-nodes-onoffice">
	<img alt="Static Badge" src="https://img.shields.io/badge/n8n-2.18.1-EA4B71?logo=n8n">
</p>

<p align="center">
  <a href="#installation">Installation</a> |
  <a href="#credentials">Credentials</a> |
  <a href="#resources">Resources</a> |
  <a href="#development">Development</a> |
  <a href="#license">License</a>
</p>

---

An n8n community node for integrating [onOffice](https://onoffice.de/) Enterprise with your workflows to manage addresses, estates, appointments, tasks, relations, search criteria, and more.

## Installation

1. Create a new workflow or open an existing one
2. Open the nodes panel by selecting **+** or pressing **N**
3. Search for **onOffice**
4. Select **Install** to install the node for your instance

Alternatively, install via **Settings** > **Community Nodes** > **Install** and enter the package name `n8n-nodes-onoffice`.

## Credentials

This node uses API token authentication via the official onOffice Enterprise API:

1. **onOffice API** -- Inside onOffice Enterprise, go to **Tools** → **API** and create a new API token. Copy the **Token** and **Secret**, then paste them into a new onOffice API credential in n8n.

## Resources

<details>
<summary><strong>Address</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create an address |
| Read | Read an address |
| Update | Update an address |
| Search | Search for addresses |
| Get Files | Get address files metadata |
| Download Files | Get download link for address files |
| Get Completion Fields | Get fields marked for address completion |
| Send Completion | Send address completion email |
| Get Select Values | Get single/multiselect field values |
| Newsletter Registration | Register/unregister address for newsletter |

</details>

<details>
<summary><strong>Agentslog</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create an agentslog entry |
| Read | Read an agentslog |
| Update | Update an agentslog entry |

</details>

<details>
<summary><strong>Appointment</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create appointment |
| Read | Read appointment |
| Update | Update appointment |
| Delete | Delete appointment |
| Get List | Get appointments list |
| Get Files | Get appointment files |
| Send Confirmation | Send appointment confirmation |

</details>

<details>
<summary><strong>E-Mail</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Do Send E-Mail | Send an email via onOffice |

</details>

<details>
<summary><strong>Estate</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create an estate |
| Read | Read an estate |
| Update | Update an estate |
| Quick Search | Quick search for estates |
| Get Files | Get estate files |
| Modify Files | Modify estate files |
| Delete Files | Delete estate files |
| Get Categories | Get estate categories |
| Get Filter | Get filters for module |
| Get Images on Homepage | Get estate images for homepage |
| Get Tenant Buyer Seeker | Get qualified suitors for estate |
| Get Statistics Widgets | Get statistics widgets |
| Get Tracking Details | Get estate tracking details |
| Generate PDF Expose | Generate a PDF expose |
| Get Selling Price Offer | Get selling price offer |
| Do Selling Price Offer | Set selling price offer |
| Create Tracking Account | Create estate tracking account |
| Create Working List | Create a working list |

</details>

<details>
<summary><strong>File</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Upload | Upload a file |
| Get Default Attachments | Get default attachment templates |

</details>

<details>
<summary><strong>Relation</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create relation |
| Get | Get relation |
| Update | Update relation |
| Delete | Delete relation |

</details>

<details>
<summary><strong>Search Criterion</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create search criteria |
| Read | Read search criteria |
| Update | Update search criteria |
| Delete | Delete search criteria |

</details>

<details>
<summary><strong>Setting</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Read User | Read user settings |
| Get Field Configuration | Get field configuration |

</details>

<details>
<summary><strong>Task</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Create | Create a task |
| Read | Read a task |
| Update | Update a task |

</details>

<details>
<summary><strong>Template</strong></summary>

| Operation | Description |
| --------- | ----------- |
| Get | Get a template |

</details>

## Development

```bash
git clone https://github.com/hansdoebel/n8n-nodes-onoffice.git
cd n8n-nodes-onoffice
npm install
npm run build
npm run lint
```

## License

[MIT](LICENSE.md)

<p align="center">
  <a href="https://github.com/hansdoebel/n8n-nodes-onoffice">GitHub</a> |
  <a href="https://github.com/hansdoebel/n8n-nodes-onoffice/issues">Issues</a> |
  <a href="https://apidoc.onoffice.de/">onOffice API Docs</a>
</p>
