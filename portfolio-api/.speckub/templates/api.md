---
speckub: false
specVersion: 1
id: '{{endpoint_id}}'
kind: http
method: '{{http_method}}'
path: '{{route_path}}'
summary: '{{summary}}'
source:
  - '{{repository_relative_source_file}}'
---

<!-- Project-local authoring template, not an endpoint spec. Customize headings,
tables and examples here. The agent replaces all {{placeholders}} from evidence;
these markers are not executable template syntax. Preserve required frontmatter.
Use actual source files, repeat source entries as needed, or omit source when
none can be established and report that gap. Keep this file in .speckub/templates/. Use speckub: true in real endpoint docs. -->

# {{title}}

## Overview

{{purpose_callers_and_scope}}

## Contract

| Property         | Value                                |
| ---------------- | ------------------------------------ |
| Method and route | {{method_and_route}}                 |
| Media types      | {{request_and_response_media_types}} |
| Version          | {{version_or_not_applicable}}        |

## Authentication and authorization

{{observed_credentials_roles_ownership_and_deployment_unknowns}}

## Request

| Field     | Location     | Type     | Required / nullable   | Constraints / default   | Meaning     |
| --------- | ------------ | -------- | --------------------- | ----------------------- | ----------- |
| {{field}} | {{location}} | {{type}} | {{required_nullable}} | {{constraints_default}} | {{meaning}} |

{{nested_body_encoding_and_conditional_rules}}

## Responses

{{status_header_and_response_field_tables}}

## Errors

| Status     | Code / message             | Trigger       | Caller action        |
| ---------- | -------------------------- | ------------- | -------------------- |
| {{status}} | {{actual_code_or_message}} | {{condition}} | {{supported_action}} |

## Behavior

{{business_rules_side_effects_idempotency_and_ordering}}

## Relationships

| Target       | Interaction     | Trigger / condition | Failure behavior              |
| ------------ | --------------- | ------------------- | ----------------------------- |
| {{identity}} | {{interaction}} | {{trigger}}         | {{observed_failure_behavior}} |

## Request flow

{{source_backed_mermaid_sequence_diagram_or_explicit_evidence_gap}}

## Examples

{{copyable_synthetic_request_success_and_failure_examples}}

## Limits and operations

{{known_limits_timeouts_and_deployment_constraints_or_explicit_unknowns}}

## Evidence and verification

{{source_symbols_scope_unknowns_and_actual_check_results}}

<!-- Omit irrelevant tables or explain why a section is not applicable. Never
fill unknowns with guesses. Distinguish source review, structural validation,
Mermaid rendering and runtime tests. No unresolved placeholders in final docs. -->
