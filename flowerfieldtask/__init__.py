doc = """Flower Field Task — version indépendante (pas de transmission)"""

from otree.api import *
from .engine import run_engine, calculate_points_from_growth
import json

class C(BaseConstants):
    NAME_IN_URL = 'flowerfieldtask'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 5

class Subsession(BaseSubsession):
    def creating_session(self):
        for p in self.session.get_participants():
            if 'total_earnings' not in p.vars:
                p.vars['total_earnings'] = 0
        for player in self.get_players():
            player.cumulative_earnings = player.participant.vars.get('total_earnings', 0)

class Group(BaseGroup):
    pass

class Player(BasePlayer):
    cumulative_earnings = models.FloatField(initial=0)

class FlowerField(Page):
    def vars_for_template(player):
        player.cumulative_earnings = player.participant.vars.get('total_earnings', 0)
        return dict()
    live_method = "live_method"
    template_name = 'flowerfieldtask/FlowerField.html'

    def live_method(player, data):
        if data['type'] == 'flowerSubmit':
            nutrients = data['data']
            output = run_engine(nutrients)
            total_growth = sum(f['growth'] for f in output) / len(output)
            total_points = calculate_points_from_growth(total_growth)
            flower_scores = [f['growth'] for f in output]
            # Accumulate total earnings for participant
            if 'total_earnings' not in player.participant.vars:
                player.participant.vars['total_earnings'] = 0
            player.participant.vars['total_earnings'] += round(total_points, 2)
            player.cumulative_earnings = player.participant.vars['total_earnings']
            return {
                player.id_in_group: dict(
                    total_growth=round(total_growth, 2),
                    total_points=round(total_points, 2),
                    flower_scores=flower_scores,
                    cumulative_earnings=player.cumulative_earnings
                )
            }

page_sequence = [FlowerField]

