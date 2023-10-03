[![New Relic Experimental header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Experimental.png)](https://opensource.newrelic.com/oss-category/#new-relic-experimental)
![GitHub forks](https://img.shields.io/github/forks/newrelic-experimental/newrelic-experimental-FIT-template?style=social)
![GitHub stars](https://img.shields.io/github/stars/newrelic-experimental/newrelic-experimental-FIT-template?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/newrelic-experimental/newrelic-experimental-FIT-template?style=social)
![GitHub all releases](https://img.shields.io/github/downloads/newrelic-experimental/newrelic-experimental-FIT-template/total)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/newrelic-experimental/newrelic-experimental-FIT-template)
![GitHub last commit](https://img.shields.io/github/last-commit/newrelic-experimental/newrelic-experimental-FIT-template)
![GitHub Release Date](https://img.shields.io/github/release-date/newrelic-experimental/newrelic-experimental-FIT-template)
![GitHub issues](https://img.shields.io/github/issues/newrelic-experimental/newrelic-experimental-FIT-template)
![GitHub issues closed](https://img.shields.io/github/issues-closed/newrelic-experimental/newrelic-experimental-FIT-template)
![GitHub pull requests](https://img.shields.io/github/issues-pr/newrelic-experimental/newrelic-experimental-FIT-template)
![GitHub pull requests closed](https://img.shields.io/github/issues-pr-closed/newrelic-experimental/newrelic-experimental-FIT-template)

# Archived
This repository is archived and deprecated in favor of https://github.com/newrelic-experimental/nr-apigee-integration.

# Apigee Distributed Tracing
This repository includes Apigee [Javascript Resources](src/main/apigee/apiproxies/W3C-Trace-Context/apiproxy/resources/jsc) for
- Creating or propagating [W3C Trace Context](https://www.w3.org/TR/trace-context/) through [Apigee Flows](https://cloud.google.com/apigee/docs/api-platform/fundamentals/what-are-flows) and on to the Apigee Target
- Reporting Flow Request/Response pairs as Spans to [New Relic's Trace API](https://docs.newrelic.com/docs/distributed-tracing/trace-api/introduction-trace-api/)

The repository also includes [sample policies](src/main/apigee/apiproxies/W3C-Trace-Context/apiproxy/policies) to demonstrate how the pieces work together.

**The documentation requires fluency with Apigee.**

## Installation
1. Copy the [Javascript Resources](src/main/apigee/apiproxies/W3C-Trace-Context/apiproxy/resources/jsc) into the `resources/jsc` folder of the Proxy
2. Copy [newrelic-sample.properties](src/main/apigee/apiproxies/W3C-Trace-Context/apiproxy/resources/properties/newrelic-sample.properties) file to `resources/properties/newrelic.properties` in the Proxy
3. Create a Request/Response Policy pair for each Flow step measured. At a minimum one pair is required to ensure that a Trace Context is present for a Target.
   - [Sample Request Policy](src/main/apigee/apiproxies/W3C-Trace-Context/apiproxy/policies/Trace-Context-Request.xml)
   - [Sample Response Policy](src/main/apigee/apiproxies/W3C-Trace-Context/apiproxy/policies/Trace-Context-Response.xml)

## Configuration
All Resource and Policy files include complete in-file documentation, see them for details

### Javascript Resources
Nothing required

### Properties file
- Edit the `newrelic.properties` file and add your New Relic License Key.

### Proxy policies
- **Proxy policies must be paired, one in a Request Flow and one in a Response Flow**
- [Flow execution sequence](https://docs.apigee.com/api-platform/fundamentals/what-are-flows#designingflowexecutionsequence)
- Start/End timestamps: [Apigee Flow Variables](https://cloud.google.com/apigee/docs/api-platform/reference/variables-reference)

## Development
### Helpful links
- [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- [Apigee development with VSCode](https://cloud.google.com/apigee/docs/api-platform/local-development/vscode/get-started)
- [Apigee JavaScript object model](https://cloud.google.com/apigee/docs/api-platform/reference/javascript-object-model)
- [Rhino features by release](https://mozilla.github.io/rhino/compat/engines.html) ([Apigee uses Rhino 1.7..7.1](https://cloud.google.com/apigee/docs/api-platform/reference/policies/javascript-policy#:~:text=Apigee%20supports%20JavaScript%20that%20runs,7.1.), it's fairly limited.)
- [New Relic Trace API Payload](https://docs.newrelic.com/docs/distributed-tracing/trace-api/report-new-relic-format-traces-trace-api/#new-relic-guidelines)

## Support
New Relic has open-sourced this project. This project is provided AS-IS WITHOUT WARRANTY OR DEDICATED SUPPORT. Issues and contributions should be reported to the project here on GitHub.

We encourage you to bring your experiences and questions to the [Explorers Hub](https://discuss.newrelic.com) where our community members collaborate on solutions and new ideas.

## Contributing
We encourage your contributions to improve Apigee Distributed Tracing! Keep in mind when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time per project. If you have any questions, or to execute our corporate CLA, required if your contribution is on behalf of a company, please drop us an email at opensource@newrelic.com.

## A note about vulnerabilities
As noted in our [security policy](../../security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

## License
Apigee Distributed Tracing is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.
