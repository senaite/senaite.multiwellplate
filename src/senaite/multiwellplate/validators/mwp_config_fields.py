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

import re
import six

from bika.lims import api
from functools import partial
from senaite.core.i18n import translate
from z3c.form import validator
from z3c.form.error import ErrorViewSnippet
from z3c.form.error import MultipleErrors
from z3c.form.error import MultipleErrorViewSnippet
from zope.interface import Invalid

from . import ValidatedData
from . import flatten_dict
from . import fail
from . import success
from senaite.multiwellplate import logger
from senaite.multiwellplate import messageFactory as _


def field_wrapper(field_name, validators):
    def validate(row):
        result = ValidatedData(
            {field_name: row.get(field_name)}).run(*validators)
        if len(result["errors"]) > 0:
            return fail(field_name, result["errors"])
        return success(row)
    return validate


def row_wrapper(row_idx, validators):
    def validate(data):
        result = ValidatedData(data[row_idx]).run(*validators)
        if len(result["errors"]) > 0:
            return fail(row_idx, result["errors"])
        return success(data)
    return validate


def non_blank_validator():
    """ check the field value is a string and non-zero length
    """
    def validate(field):
        k, v = next(iter(field.items()))
        if not isinstance(v, six.string_types) or len(v) == 0:
            return fail("non_blank_validator",
                        translate(_(u"non_blank_validator_error",
                                    default=u"'${field_name}' is required",
                                    mapping={"field_name": k}))
                        )
        return success(field)
    return validate


def invalid_characters_validator():
    def validate(field):
        k, v = next(iter(field.items()))
        if v and not re.match(r"^[A-Za-z\w\d\-\_]+$", v):
            return fail("invalid_characters_validator",
                        translate(
                            _(u"invalid_characters_validator_error",
                                default=u"'${field_name}' "
                                        u"contains invalid characters",
                                mapping={"field_name": k}))
                        )
        return success(field)
    return validate


def no_dup_value_validator(rows):
    def validate(field):
        k, v = next(iter(field.items()))
        dups = filter(lambda r: r[k] == v, rows)
        if len(dups) > 1:
            return fail("no_dups_values_validator",
                        translate(_(u"no_dups_values_validator_error",
                                    default=u"'${duplicate}' duplicates found",
                                    mapping={"duplicate": k}))
                        )
        return success(field)
    return validate


class MWPConfigFieldsValidator(validator.SimpleFieldValidator):
    """
    """
    def validate(self, value):

        data = {str(idx): dict({"row_idx": idx}, **v)
                for idx, v in enumerate(value or [], start=1)}
        rows = data.values()

        _validators = [
            field_wrapper("keyword", [
                non_blank_validator(),
                invalid_characters_validator(),
                no_dup_value_validator(rows),
            ]),
            field_wrapper("title", [
                non_blank_validator(),
                no_dup_value_validator(rows),
            ]),
            field_wrapper("value", [
                non_blank_validator(),
            ])
        ]
        row_validators = [row_wrapper(k, _validators) for k in data.keys()]
        try:
            result = ValidatedData(data).run(*row_validators)
        except Exception as err:
            logger.error("ERROR FIELDS VALIDATION CHAIN: {}".format(err))
            raise Invalid(translate(_(
                u"fields_validation_chain_error",
                default=u"Validation chain internal error: ${error}",
                mapping={"error": err}
            )))
        errors = {k: flatten_dict(v) for k, v in result["errors"].items() if v}
        if errors:
            # TODO: when ZOPE version will reach 5.0 replace w/ MultipleInvalid
            # - no special Error views required then
            # https://github.com/zopefoundation/zope.interface/blob/7e0be48d15c594cc592537da2da98311017b19ab/src/zope/interface/exceptions.py#L235C7-L235C22
            errors_list = []
            for k, v in errors.items():
                for val_name, error_message in v.items():
                    errors_list.append((k, val_name, error_message))
            raise MultipleErrors(sorted(errors_list, key=lambda e: e[0]))


class MWPConfigErrorViewSnippet(ErrorViewSnippet):

    def __init__(self, error, request, widget, field, form, content):
        super(MWPConfigErrorViewSnippet, self).__init__(
            error, request, widget, field, form, content)
        self.message = translate(
            _(u"config_field_error",
              default=u"Field ${row_num}: ${message}",
              mapping={
                  "row_num": self.content[0],
                  "message": api.safe_unicode(self.content[2])
              }))

    def update(self):
        pass


class MWPConfigFieldsValidationErrorView(MultipleErrorViewSnippet):

    def __init__(self, error, request, widget, field, form, content):
        super(MWPConfigFieldsValidationErrorView, self).__init__(
            error, request, widget, field, form, content)
        err_snippet = partial(MWPConfigErrorViewSnippet,
                              error, request, widget, field, form)
        self.error.errors = (err_snippet(err) for err in self.error.errors)
