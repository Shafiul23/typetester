import pytest
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from flaskr import create_app
from flaskr.auth import generate_jwt
from flaskr.db import db
from flaskr.models import Score, User


@pytest.fixture
def app():
    app = create_app({'TESTING': True, 'SQLALCHEMY_DATABASE_URI': 'sqlite://'})
    with app.app_context():
        db.session.add(User(username='tester', password='unused'))
        db.session.commit()
    yield app
    with app.app_context():
        db.session.remove()
        db.drop_all()


def headers():
    return {'Authorization': f'Bearer {generate_jwt(1, "tester")}'}


@pytest.mark.parametrize('duration', [15, 30, 60])
def test_save_and_read_duration(app, duration):
    client = app.test_client()
    response = client.post('/auth/scores', json={'score': 85, 'duration_seconds': duration}, headers=headers())
    assert response.status_code == 201
    personal = client.get('/auth/personal', headers=headers()).json['personal']
    assert personal[0]['duration_seconds'] == duration
    board = client.get(f'/auth/leaderboard?duration_seconds={duration}').json['leaderboard']
    assert board[0]['duration_seconds'] == duration


@pytest.mark.parametrize('duration', [None, 0, 45, '30', True, 30.0])
def test_invalid_duration_is_rejected(app, duration):
    response = app.test_client().post('/auth/scores', json={'score': 85, 'duration_seconds': duration}, headers=headers())
    assert response.status_code == 400


def test_filter_before_limit_and_preserve_unknown(app):
    with app.app_context():
        db.session.add_all([Score(user_id=1, score=200 + i, duration_seconds=15) for i in range(25)])
        db.session.add_all([Score(user_id=1, score=80, duration_seconds=60), Score(user_id=1, score=90, duration_seconds=30), Score(user_id=1, score=999)])
        db.session.commit()
    client = app.test_client()
    assert [row['score'] for row in client.get('/auth/leaderboard?duration_seconds=60').json['leaderboard']] == [80]
    assert [row['score'] for row in client.get('/auth/leaderboard').json['leaderboard']] == [90]
    personal = client.get('/auth/personal?duration_seconds=60', headers=headers()).json['personal']
    assert [row['score'] for row in personal] == [80]
    personal = client.get('/auth/personal?order_by=score', headers=headers()).json['personal']
    assert personal[0]['duration_seconds'] is None
    for endpoint in ['/auth/personal?duration_seconds=45', '/auth/leaderboard?duration_seconds=45']:
        assert client.get(endpoint, headers=headers()).status_code == 400


def test_cooldown_still_applies_across_durations(app):
    client = app.test_client()
    assert client.post('/auth/scores', json={'score': 80, 'duration_seconds': 15}, headers=headers()).status_code == 201
    assert client.post('/auth/scores', json={'score': 80, 'duration_seconds': 60}, headers=headers()).status_code == 429


def test_migration_preserves_existing_scores_and_is_repeatable(app):
    with app.app_context():
        db.session.execute(text('DROP TABLE score'))
        db.session.execute(text('CREATE TABLE score (id INTEGER PRIMARY KEY, user_id INTEGER, score INTEGER, created TIMESTAMP)'))
        db.session.execute(text("INSERT INTO score VALUES (1, 1, 75, '2026-01-01')"))
        db.session.commit()
    runner = app.test_cli_runner()
    for _ in range(2):
        result = runner.invoke(args=['migrate-score-duration'])
        assert result.exit_code == 0, result.output
    with app.app_context():
        row = db.session.execute(text('SELECT score, duration_seconds FROM score')).one()
        assert tuple(row) == (75, None)
        with pytest.raises(IntegrityError):
            db.session.execute(text('UPDATE score SET duration_seconds = 45'))
        db.session.rollback()
