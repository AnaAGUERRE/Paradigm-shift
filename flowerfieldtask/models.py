from otree.api import BasePlayer, models

class Player(BasePlayer):
    phase = models.StringField()
    round_number = models.IntegerField()
    flower_colors = models.StringField()
    nutrient_choice = models.StringField()
    score_flower1 = models.IntegerField()
    score_flower2 = models.IntegerField()
    score_flower3 = models.IntegerField()
    noise_applied = models.StringField()
    birth_year = models.IntegerField()
    survey_answer1 = models.StringField()
    survey_answer2 = models.StringField()
    # Add more survey fields as needed
