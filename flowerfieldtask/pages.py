from otree.api import *
from .engine import run_engine

# oTree page logic for the Flower Field Task experiment

class C(BaseConstants):
    NAME_IN_URL = 'flowerfieldtask'  # URL name for this app
    PLAYERS_PER_GROUP = None         # No groups, individual play
    NUM_ROUNDS = 1                  # Single round experiment

class Subsession(BaseSubsession):
    def creating_session(self):
        # Initialize total earnings for each participant
        for p in self.session.get_participants():
            if not hasattr(p, 'total_earnings') or p.total_earnings is None:
                p.total_earnings = 0

class Group(BaseGroup):
    # No group logic needed for this experiment
    pass

class Player(BasePlayer):
    # Stores the player's total growth and points for the round
    total_growth = models.FloatField(initial=0)
    total_points = models.FloatField(initial=0)


# Converts growth to points (customize multiplier if needed)
def calculate_points(growth):
    return round(growth * 1, 2)


class FlowerField(Page):
    # Handles live submission of flower choices from the frontend
    live_method = 'live_flower_submit'

    def live_flower_submit(self, data):
        if data.get('type') == 'flowerSubmit':
            flower_choices = data.get('data')
            # Compute growth for each flower using engine.py
            results = run_engine(flower_choices)
            flower_scores = [r['growth'] for r in results]
            # Calculate average growth and points
            total_growth = sum(flower_scores) / len(flower_scores)
            total_points = calculate_points(total_growth)
            self.player.total_growth = total_growth
            self.player.total_points = total_points
            # Accumulate total earnings for participant
            if not hasattr(self.participant, 'total_earnings') or self.participant.total_earnings is None:
                self.participant.total_earnings = 0
            self.participant.total_earnings += total_points
            # Send results back to frontend
            self.send({
                'total_growth': total_growth,
                'total_points': total_points,
                'flower_scores': flower_scores,
            })

page_sequence = [FlowerField]  # Sequence of pages in the experiment
