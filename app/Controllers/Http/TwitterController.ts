import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { scope } from "@ioc:Adonis/Lucid/Orm";
import Comment from "App/Models/Comment";
import Post from "App/Models/Post";
import Friend from "App/Models/Friend";
import User from "App/Models/User";

export default class TwitterController {
  async index({ view, auth }: HttpContextContract) {
    const posts = await Post.query()
      .withScopes((scopes) => scopes.timeLineOfUSer(auth.use("web").user))
      .withScopes((scopes) => scopes.notDeleted())
      .preload("user")
      .preload("comments", (a) => {
        a.preload("user").withScopes((scopes) => scopes.notDeleted());
      });
    return view.render("twitter/index", {
      posts,
    });
  }

  async list({ view, auth }: HttpContextContract) {
    const usuarios = await User.query().orderBy("created_at", "desc").withScopes((scopes) => scopes.notMyself(auth.use("web").user));
    return view.render("twitter/list", {
      usuarios,
    });
  }

  async store({ request, response, auth }: HttpContextContract) {
    if (auth.use("web").user != null) {
      try {
        const data = {
          post: request.input("post"),
          userId: auth.use("web").user?.id,
        };

        await Post.create(data);
      } catch (e) {
        // mensagem de erro
      }
      return response.redirect().back();
    }
  }

  async delete({ response, bouncer, params }: HttpContextContract) {
    try {
      const post = await Post.findOrFail(params.id);
      await bouncer.authorize("deletePost", post);
      post.isDeleted = true;
      await post.save();
    } catch (e) {
      console.log(e);
    }
    return response.redirect().back();
  }

  async storeComment({ request, response, auth, params }: HttpContextContract) {
    if (auth.use("web").user != null) {
      try {
        const data = {
          comment: request.input("comment"),
          userId: auth.use("web").user?.id,
          postId: params.id,
        };

        await Comment.create(data);
      } catch (e) {
        console.log(e);
      }
      return response.redirect().back();
    }
  }

  async deleteComment({ response, bouncer, params }: HttpContextContract) {
    try {
      const comment = await Comment.findOrFail(params.id);
      await bouncer.authorize("deleteComment", comment);
      comment.isDeleted = true;
      await comment.save();
    } catch (e) {
      console.log(e);
    }
    return response.redirect().back();
  }

  async follow({ response, bouncer, params, auth }: HttpContextContract) {
    try {
      const userIdA = auth.use("web").user?.id;
      const t1 = await Friend.query()
        .orWhere({ userId1: params.id, userId2: userIdA })
        .orWhere({ userId2: params.id, userId1: userIdA });

      if (t1.length == 0 && userIdA != Number(params.id)) {
        await Friend.create({
          userId1: userIdA,
          userId2: params.id,
        });
      }
    } catch (e) {}

    response.redirect().back();
  }

  async unFollow({ response, params, auth }: HttpContextContract) {
    try {
      const userIdA = auth.use("web").user?.id;
      await Friend.query()
        .orWhere({ userId1: params.id, userId2: userIdA })
        .orWhere({ userId2: params.id, userId1: userIdA }).del()

      
    } catch (e) {
      console.log(e);
    }

    response.redirect().back();
  }
}
