# client-identifier-helper

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE-OF-CONDUCT.md)

This project adheres to the Contributor Covenant [code of conduct](CODE-OF-CONDUCT.md).
By participating, you are expected to uphold this code. Please report unacceptable
behavior to [engineering@inrupt.com](mailto:engineering@inrupt.com).

A tool to create and validate Client Identifier Documents. You can find a live version [here](https://client-identifier-helper.vercel.app/).

This web application provides a validator and a generator for [Solid Client Identifier Documents](https://solidproject.org/TR/oidc#clientids), to help developers set up their Solid apps.

## Technical Details

Client Identifier Documents are used to identify the client to a Solid-OIDC provider. They describe client metadata conventionally provided in static or dynamic client registration in OpenID Connect.
A Solid Client Identifier is a Universal Resource Identifier (URI) that points to the Client Identifier Document, allows Resource Servers to uniquely identify the client, show the user rich information when granting access, and enforce access control tied to the client.

### Advantages of Solid OpenID Connect in contrast to OpenID Connect Dynamic Client Registration

In contrast to [OpenID Connect (OIDC) dynamic client registration](https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata), Client Identifier Documents offer several advantages:

- They have a dereferencable URI under the control of the client, which works better in a decentralized ecosystem, as there is no need for the Authorization Server to have advanced knowledge of the client.
- Because the Solid Client Identifier is a _unique universal_ client identity, the Resource Servers can enforce client-specific access control.

## Installation for Development

To install the latest version of the Client Identifier Helper locally, run:

```bash
git clone https://github.com/inrupt/client-identifier-helper.git
cd client-identifier-helper
npm install
```

Then, to develop the application, run:

```bash
npm run dev
```

To run the application as if was deployed, run:

```bash
npm run build
npm run preview
```

# Issues & Help

## Solid Community Forum

If you have questions about working with Solid or just want to share what you’re
working on, visit the [Solid forum](https://forum.solidproject.org/). The Solid
forum is a good place to meet the rest of the community.

## Bugs and Feature Requests

- For public feedback, bug reports, and feature requests please file an issue
  via [Github](https://github.com/inrupt/client-identifier-helper/issues/).
- For non-public feedback or support inquiries please use the
  [Inrupt Service Desk](https://inrupt.atlassian.net/servicedesk).

## Documentation

- [Solid OIDC Tutorial for Inrupt's Javascript Client Libraries](https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/authenticate-client/)
- [Authentication specification primer](https://solidproject.org/TR/oidc-primer)
- [Authentication specification](https://solidproject.org/TR/oidc#clientids-document)
- [All Inrupt Solid Javascript Client Libraries](https://docs.inrupt.com/developer-tools/javascript/client-libraries/)
- [Homepage](https://docs.inrupt.com/)

# Changelog

This project is continuously released to vercel using the `main` branch.

# License

MIT © [Inrupt](https://inrupt.com)
