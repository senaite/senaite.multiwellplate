# -*- coding: utf-8 -*-
#
# This file is part of SENAITE.MULTIWELLPLATE.
#
# SENAITE.MULTIWELLPLATE is free software: you can redistribute it and/or
# modify it under the terms of the GNU General Public License as published
# by the Free Software Foundation, version 2.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
# details.
#
# You should have received a copy of the GNU General Public License along with
# this program; if not, write to the Free Software Foundation, Inc., 51
# Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#
# Copyright 2026 by it's authors.
# Some rights reserved, see README and LICENSE.

from senaite.core.i18n import translate as t
from z3c.form.browser.widget import HTMLFormElement
from z3c.form.converter import BaseDataConverter
from z3c.form.interfaces import IFieldWidget
from z3c.form.interfaces import NO_VALUE
from z3c.form.widget import FieldWidget
from z3c.form.widget import Widget
from zope.component import adapter
from zope.component import queryUtility
from zope.interface import implementer
from zope.schema.interfaces import IVocabularyFactory

from senaite.multiwellplate.interfaces import ISenaiteMultiWellPlateLayer
from senaite.multiwellplate.schema.interfaces import IMultiSelectField
from senaite.multiwellplate.z3cform.interfaces import IMultiSelectWidget


@adapter(IMultiSelectField, IMultiSelectWidget)
class MultiSelectDataConverter(BaseDataConverter):
    """Converts between the field list value and the widget representation
    """

    def toWidgetValue(self, value):
        if not value:
            return []
        return list(value)

    def toFieldValue(self, value):
        if not value:
            return []
        if isinstance(value, str):
            return [value] if value else []
        return [v for v in value if v]


@implementer(IMultiSelectWidget)
class MultiSelectWidget(HTMLFormElement, Widget):
    """Dropdown widget with checkboxes for multiple selection
    """
    klass = u"multiselect-widget"

    def extract(self, default=NO_VALUE):
        """Extract the list of selected values from the request.

        Uses an empty-marker hidden input to distinguish between a form that
        was not submitted at all and one that was submitted with nothing checked.
        """
        marker = self.name + "-empty-marker"
        if marker not in self.request:
            return default
        value = self.request.get(self.name, [])
        if isinstance(value, str):
            return [value] if value else []
        if isinstance(value, (list, tuple)):
            return list(value)
        return []

    @property
    def terms(self):
        """Return available terms from the field.

        Each term is a dict with ``token`` (the stored value) and
        ``title`` (the human-readable label).
        """
        vocabulary = self.get_vocabulary()
        if not vocabulary:
            return []
        terms = []
        for term in vocabulary:
            terms.append({
                "token": term.value,
                "title": t(term.title),
            })
        return terms

    def get_vocabulary(self):
        if not self.field:
            return None

        vocabulary = getattr(self.field, "vocabulary", None)
        if not vocabulary:
            return None

        factory = queryUtility(IVocabularyFactory, vocabulary,)
        if not factory:
            return None

        return factory(self.context)

    @property
    def selected_tokens(self):
        """Return the list of currently selected token strings.
        """
        value = self.value
        if not value:
            return []
        if isinstance(value, (list, tuple)):
            return [str(v) for v in value]
        return [str(value)]


@adapter(IMultiSelectField, ISenaiteMultiWellPlateLayer)
@implementer(IFieldWidget)
def MultiSelectWidgetFactory(field, request):
    """Widget factory for MultiSelectField
    """
    return FieldWidget(field, MultiSelectWidget(request))
