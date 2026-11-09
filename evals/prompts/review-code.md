You are evaluating whether a Java agent skill is followed.

Skill:
{{ skill }}

{% if reference %}
Relevant skill reference:
{{ reference }}
{% endif %}

{% if project_instructions %}
Project instructions:
{{ project_instructions }}
{% endif %}

Code:
```java
{{ code }}
```

Review the code only against the supplied skill. Do not invent unrelated project constraints.
Identify violations, explain why each violates the skill, and propose a concise fix. If there are no violations, say so.
