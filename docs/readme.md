### API ###

Root: /api

Endpoints: 

* /articles
* /images
* /versions
* /revisions
* /users

Resource identifiers:

* Best: id.  Example: /api/v1/articles/5
* Acceptable: name.  Example: /api/v1/articles/Home

Queries:

		GET /api/v1/articles (retrieves all articles)
		GET /api/v1/articles?versionName=7.3 (retrieves all articles that have versionName = 7.3)
		GET /api/v1/articles/8 (retrieves article with default property (i.e. id) = 8
		GET /api/v1/articles?foobar (retrieves all articles matching generic search query "foobar" (using FULLTEXT))
		POST /api/v1/articles (creates new article using JSON object sent in body)
		PUT /api/v1/articles/8 (updates article with id:8 using JSON object sent in body)
		DELETE /api/v1/articles/8 (deletes article with id:8)



### Features ###
* Metadata:
** User table tracks last activity timestamp
** On next login, reports how many changes since your last visit
** Polling service watches for changes, prompts to refresh articles


==Work Queue==
Problem: you publish a draft, then load a new page, then start editing the menu...then the first publish fails. Now everything's all fucked up.

Solution: everything goes into a queue, which is processed in series. Each queue item has an action, a body (everything needed to complete the action), and rollback information.

Example, in which the latency is very high:
* Open article Foo for editing. Queue: [ getFooDraft ]
* Wait until queue finished and edit UI becomes available.
* Edit article Foo.  Queue: [ saveDraft ]
* Change to article Bar.  Queue: [ saveDraft, loadArticle ]
* saveDraft operation comes back with an authentication error. Queue does not process until user interacts. User enters new auth info. Queue: [ authentication, saveDraft, loadArticle ]
* auth action succeeds. saveDraft begins.
* saveDraft fails due to unspecified error. UI must now return to the rollback state. UI uses rollback data to reload the Edit Article UI with the exact data that was present when the user clicked "publish". User corrects the issue, whatever it was, then clicks Publish again. Queue: [ saveDraft, loadArticle ]
* saveDraft succeeds. Queue processes, loading article.
* article loads successfully.

UI reqs:
* There is a small, dedicated space for queue status, perhaps in the upper right next to the gear icon.
* When the queue is empty, it indicates that everything is a-ok.
* When the queue is not empty, it shows a "syncing" icon.
** This icon has a rollover state that shows details about which jobs are in the queue.
* When the queue has stalled, it shows an "alert" icon, and the tooltip is forced open to explain the alert.
** This might be something like "please enter credentials", or "error saving article".
** The queue does not change the UI state on its own; it presents buttons to rollback, take action, or cancel jobs.