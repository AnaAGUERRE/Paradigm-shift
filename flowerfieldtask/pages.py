from otree.api import *
from .engine import run_engine

class C(BaseConstants):
    NAME_IN_URL = 'flowerfieldtask'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1

class Subsession(BaseSubsession):
    def creating_session(self):
        for p in self.session.get_participants():
            if not hasattr(p, 'total_earnings') or p.total_earnings is None:
                p.total_earnings = 0
    pass

class Group(BaseGroup):
    pass

class Player(BasePlayer):
    total_growth = models.FloatField(initial=0)
    total_points = models.FloatField(initial=0)

# Example points calculation (customize as needed)
def calculate_points(growth):
    return round(growth * 10, 2)

class FlowerField(Page):
    live_method = 'live_flower_submit'

    def live_flower_submit(self, data):
        if data.get('type') == 'flowerSubmit':
            flower_choices = data.get('data')
            # Compute growth for each flower
            results = run_engine(flower_choices)
            flower_scores = [r['growth'] for r in results]
            total_growth = sum(flower_scores) / len(flower_scores)
            total_points = calculate_points(total_growth)
            self.player.total_growth = total_growth
            self.player.total_points = total_points
            # Accumulate total earnings for participant
            if not hasattr(self.participant, 'total_earnings') or self.participant.total_earnings is None:
                self.participant.total_earnings = 0
            self.participant.total_earnings += total_points
            self.send({
                'total_growth': total_growth,
                'total_points': total_points,
                'flower_scores': flower_scores,
            })

page_sequence = [FlowerField]
