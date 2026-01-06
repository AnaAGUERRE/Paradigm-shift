
from otree.api import models

class Player(models.Player):
    qcm_click_sequence = models.LongStringField(blank=True)
