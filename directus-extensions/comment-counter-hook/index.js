export default ({ action, filter }, { services, getSchema }) => {
	const { ItemsService } = services;

	// Store comment data before deletion
	let commentsToDelete = new Map();

	// When a comment is created (after creation)
	action('comments.items.create', async (meta, context) => {
		const schema = await getSchema();
		const postsService = new ItemsService('posts', {
			schema,
			accountability: null,
		});
		const commentsService = new ItemsService('comments', {
			schema,
			accountability: null,
		});

		console.log('🔥 Comment created hook triggered');

		try {
			// Get post_id from the creation payload - try both field names
			const postId = meta.payload?.post_id || meta.payload?.post;
			
			if (!postId) {
				console.log('❌ No post_id or post found in payload, skipping update');
				return;
			}

			console.log(`📊 Updating comment count for post: ${postId}`);

			// Count ALL comments for this post (the new comment is already in the database)
			const commentCount = await commentsService.readByQuery({
				filter: { post: { _eq: postId } },
				aggregate: { count: ['*'] },
			});

			const newCount = commentCount[0]?.count || 0;

			// Update the post's comment_count field
			await postsService.updateOne(postId, {
				comment_count: String(newCount),
			});

			console.log(`✅ CREATE: Updated post ${postId} comment count to ${newCount}`);
		} catch (error) {
			console.error('❌ Error updating comment count on create:', error);
		}
	});

	// FILTER: Before comment deletion - capture the comment data
	filter('comments.items.delete', async (payload, meta, context) => {
		const schema = await getSchema();
		const commentsService = new ItemsService('comments', {
			schema,
			accountability: null,
		});

		console.log('� FILTER: About to delete comments, capturing data first');

		try {
			// The payload contains the comment ID(s) being deleted
			const commentIds = Array.isArray(payload) ? payload : [payload];
			
			console.log('📝 Comment IDs to be deleted:', commentIds);

			// Get the comments that are being deleted BEFORE they're actually deleted
			const deletingComments = await commentsService.readMany(commentIds, {
				fields: ['id', 'post']
			});

			console.log('� Captured comment data:', deletingComments.map(c => ({ id: c.id, post: c.post })));

			// Store the data for the action hook
			for (const comment of deletingComments) {
				commentsToDelete.set(comment.id, comment.post);
			}

		} catch (error) {
			console.error('❌ Error capturing comment data before deletion:', error);
		}

		// Return the payload unchanged to continue with deletion
		return payload;
	});

	// ACTION: After comment deletion - update the counts
	action('comments.items.delete', async (meta, context) => {
		const schema = await getSchema();
		const postsService = new ItemsService('posts', {
			schema,
			accountability: null,
		});
		const commentsService = new ItemsService('comments', {
			schema,
			accountability: null,
		});

		console.log('🗑️ ACTION: Comment(s) deleted, updating counts');

		try {
			const commentIds = meta.keys || [meta.key];
			
			console.log('🔢 Processing count updates for deleted comments:', commentIds);

			// Group by post using our stored data
			const affectedPosts = new Set();
			for (const commentId of commentIds) {
				const postId = commentsToDelete.get(commentId);
				if (postId) {
					affectedPosts.add(postId);
					// Clean up stored data
					commentsToDelete.delete(commentId);
				}
			}

			console.log('📊 Posts to update:', Array.from(affectedPosts));

			// Update each affected post's comment count
			for (const postId of affectedPosts) {
				// Count current comments for this post
				const commentCount = await commentsService.readByQuery({
					filter: { post: { _eq: postId } },
					aggregate: { count: ['*'] },
				});

				const newCount = commentCount[0]?.count || 0;

				await postsService.updateOne(postId, {
					comment_count: String(newCount),
				});

				console.log(`✅ DELETE: Updated post ${postId} comment count to ${newCount}`);
			}
		} catch (error) {
			console.error('❌ Error updating comment count on delete:', error);
		}
	});
};
