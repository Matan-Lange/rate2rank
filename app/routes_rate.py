from flask import Blueprint, request, jsonify
from app import db
from app.models import Group, Rate, Question, CrowdRating, Rank, QuestionAnswer
from flask_jwt_extended import current_user, jwt_required

from datetime import datetime

rate = Blueprint('rate', __name__)


@rate.route('/rate', methods=['GET'])
@jwt_required()
def get_groups():
    group_name = db.session.query(Group).filter_by(number=request.headers.get('group_number')).one_or_none()
    # if group valid
    if group_name:
        questions = {q.number: q.description for q in Question.query.all()}

        return jsonify(status=200, data={"group_name": group_name.name, "questions": questions})

    # check response number
    return jsonify(status=400, msg="Group not registered")


@rate.route('/rate', methods=['POST'])
@jwt_required()
def rate_page():
    data = request.json.get('data')
    group_number = data['group_number']
    text_answer = data['text_answer']

    rate = Rate(username=current_user.username,
                group_number=group_number,
                datetime=datetime.now(),
                rate=data['rate'])

    crowd_ratings = data['crowd_ratings']

    crowd_ratings = CrowdRating(username=current_user.username,
                                group_number=group_number,
                                outstanding=crowd_ratings['outstanding'],
                                very_good=crowd_ratings['very_good'],
                                good=crowd_ratings['good'],
                                fair=crowd_ratings['fair'],
                                needs_improvement=crowd_ratings['needs_improvement'])

    # add users answers
    questions_numbers = {q.number for q in Question.query.all()}
    for q_num in questions_numbers:
        q_add = QuestionAnswer(user_id=current_user.username,
                               question_number=int(q_num),
                               text_answer=text_answer[str(q_num)])
        db.session.add(q_add)

    db.session.add(rate)
    db.session.add(crowd_ratings)
    db.session.commit()

    # ranking
    # ToDo add check if same rates
    exs_rank = Rank.query.filter_by(username=current_user.username, date=datetime.today().date()).first()

    # if users first input insert ranking to db
    if not exs_rank:
        t = [(group_number, rate.rate)]
        rank = Rank(username=current_user.username, date=datetime.today().date(), list_rank=repr(t))
        db.session.add(rank)
        db.session.commit()
        return jsonify(status=200, ranking=False)
    else:
        return jsonify(status=200, ranking=True, data={"rank_list": exs_rank.list_rank})
