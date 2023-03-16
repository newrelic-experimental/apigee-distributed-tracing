# Change Log
All notable changes to this project will be documented in this file.
 
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).
 
## [0.9.1] - 2023-03-16
 
A minor release to make the traceparent header compliant with the W3C version 00 standard.
 
### Added
 
### Changed
 
### Fixed

Fixes issue [#1](https://github.com/newrelic-experimental/apigee-distributed-tracing/issues/1).

Increase length of parent-id component of the W3C traceparent header to 16 characters, to comply with the [W3C standard](https://www.w3.org/TR/trace-context/#parent-id) for version 00.

Comment out reference to pub/sub message policy that is no longer present in the repo. This allows the sample code to work with minimal configuration.

