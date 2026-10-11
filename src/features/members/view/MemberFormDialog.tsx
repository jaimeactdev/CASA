'use client';

import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { colors, fontSizes } from '@/styles/designTokens';
import InputFieldMUI from '@/shared/ui/mui/InputFieldMUI';
import DateFieldMUI from '@/shared/ui/mui/DateFieldMUI';
import SelectFieldMUI from '@/shared/ui/mui/SelectFieldMUI';
import RadioButtonFieldMUI from '@/shared/ui/mui/RadioButtonFieldMUI';
import TextAreaFieldMUI from '@/shared/ui/mui/TextAreaFieldMUI';
import HoverIconButton from '@/shared/ui/mui/HoverIconButton';
import AppDialog from '@/shared/ui/Modal/AppDialog';
import {
  DOCUMENT_TYPE_OPTIONS,
  SEX_OPTIONS,
  STATUS_OPTIONS,
} from '../domain/membersTypes';
import type { useMembersViewModel } from '../viewmodel/useMembersViewModel';

type MembersViewModel = ReturnType<typeof useMembersViewModel>;

function SectionTitle({ children }: { children: string }) {
  return (
    <Typography
      sx={{
        fontWeight: 600,
        color: colors.textPrincipal,
        fontSize: fontSizes.md,
        mt: 1,
      }}
    >
      {children}
    </Typography>
  );
}

export default function MemberFormDialog({ vm }: { vm: MembersViewModel }) {
  const theme = useTheme();
  const fieldHalf = { ...theme.customStyleForm.grid6md, display: 'block' };
  const fieldFull = { ...theme.customStyleForm.grid12md, display: 'block' };
  const readOnly = Boolean(vm.editing) && !vm.canEdit;
  const creating = !vm.editing;

  return (
    <AppDialog open={vm.formOpen} onClose={vm.closeForm} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={vm.saveForm} noValidate>
        <DialogTitle>
          {creating ? 'Nuevo afiliado' : vm.canEdit ? 'Editar afiliado' : 'Afiliado'}
        </DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, maxHeight: '70vh' }}
        >
          <SectionTitle>Identificación</SectionTitle>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', rowGap: 3 }}>
            <Box sx={fieldHalf}>
              <SelectFieldMUI
                name="documentType"
                label="Tipo de documento"
                value={vm.values.documentType}
                onChange={vm.onChangeDocumentType}
                options={[...DOCUMENT_TYPE_OPTIONS]}
                error={vm.errors.documentType}
                disabled={readOnly}
              />
            </Box>
            <Box sx={fieldHalf}>
              <InputFieldMUI
                name="documentNumber"
                label="Número de documento"
                value={vm.values.documentNumber}
                onChange={vm.onChangeDocumentNumber}
                error={vm.errors.documentNumber}
                disabled={readOnly}
                maxlenght={30}
              />
            </Box>
            <Box sx={fieldHalf}>
              <InputFieldMUI
                name="firstNames"
                label="Nombres"
                value={vm.values.firstNames}
                onChange={vm.onChangeFirstNames}
                error={vm.errors.firstNames}
                disabled={readOnly}
                keyfilter="alpha-es"
                maxlenght={80}
              />
            </Box>
            <Box sx={fieldHalf}>
              <InputFieldMUI
                name="lastNames"
                label="Apellidos"
                value={vm.values.lastNames}
                onChange={vm.onChangeLastNames}
                error={vm.errors.lastNames}
                disabled={readOnly}
                keyfilter="alpha-es"
                maxlenght={80}
              />
            </Box>
            <Box sx={fieldFull}>
              <RadioButtonFieldMUI
                name="sex"
                label="Sexo"
                value={vm.values.sex}
                direction="row"
                options={[...SEX_OPTIONS]}
                onChange={vm.onChangeSex}
                error={vm.errors.sex}
                disabled={readOnly}
              />
            </Box>
            <Box sx={fieldHalf}>
              <DateFieldMUI
                name="birthDate"
                label="Fecha de nacimiento"
                value={vm.values.birthDate}
                onChange={vm.onChangeBirthDate}
                error={vm.errors.birthDate}
                disabled={readOnly}
                restrictYearRange={false}
                maxDate={vm.today || undefined}
              />
            </Box>
          </Box>

          <SectionTitle>Contacto</SectionTitle>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', rowGap: 3 }}>
            <Box sx={fieldHalf}>
              <InputFieldMUI
                name="mobilePhone"
                label="Celular"
                value={vm.values.mobilePhone}
                onChange={vm.onChangeMobilePhone}
                error={vm.errors.mobilePhone}
                disabled={readOnly}
                keyfilter="pnum"
                maxlenght={20}
              />
            </Box>
            <Box sx={fieldHalf}>
              <InputFieldMUI
                name="phone"
                label="Teléfono"
                value={vm.values.phone}
                onChange={vm.onChangePhone}
                error={vm.errors.phone}
                disabled={readOnly}
                keyfilter="pnum"
                maxlenght={20}
              />
            </Box>
            <Box sx={fieldHalf}>
              <InputFieldMUI
                name="email"
                label="Correo"
                value={vm.values.email}
                onChange={vm.onChangeEmail}
                error={vm.errors.email}
                disabled={readOnly}
                keyfilter="email"
                maxlenght={160}
              />
            </Box>
            <Box sx={fieldHalf}>
              <InputFieldMUI
                name="residenceCity"
                label="Ciudad de residencia"
                value={vm.values.residenceCity}
                onChange={vm.onChangeResidenceCity}
                error={vm.errors.residenceCity}
                disabled={readOnly}
                maxlenght={80}
              />
            </Box>
            <Box sx={fieldFull}>
              <InputFieldMUI
                name="address"
                label="Dirección"
                value={vm.values.address}
                onChange={vm.onChangeAddress}
                error={vm.errors.address}
                disabled={readOnly}
                maxlenght={200}
              />
            </Box>
          </Box>

          <SectionTitle>Tallas</SectionTitle>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', rowGap: 3 }}>
            <Box sx={fieldHalf}>
              <InputFieldMUI
                name="shirtSize"
                label="Camisa"
                value={vm.values.shirtSize}
                onChange={vm.onChangeShirtSize}
                disabled={readOnly}
                maxlenght={20}
                smallText="Sugeridos: XS, S, M, L, XL, XXL u otro."
              />
            </Box>
            <Box sx={fieldHalf}>
              <InputFieldMUI
                name="pantsSize"
                label="Pantalón"
                value={vm.values.pantsSize}
                onChange={vm.onChangePantsSize}
                disabled={readOnly}
                maxlenght={20}
              />
            </Box>
            <Box sx={fieldHalf}>
              <InputFieldMUI
                name="shoeSize"
                label="Calzado"
                value={vm.values.shoeSize}
                onChange={vm.onChangeShoeSize}
                disabled={readOnly}
                maxlenght={20}
              />
            </Box>
          </Box>

          <SectionTitle>Afiliación</SectionTitle>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', rowGap: 3 }}>
            <Box sx={fieldHalf}>
              <DateFieldMUI
                name="joinedOn"
                label="Fecha de afiliación"
                value={vm.values.joinedOn}
                onChange={vm.onChangeJoinedOn}
                error={vm.errors.joinedOn}
                disabled={readOnly}
                maxDate={vm.today || undefined}
              />
            </Box>
            <Box sx={fieldHalf}>
              <SelectFieldMUI
                name="profileId"
                label="Perfil"
                value={vm.values.profileId}
                onChange={vm.onChangeProfileId}
                options={vm.profileOptions}
                error={vm.errors.profileId}
                disabled={readOnly}
              />
            </Box>
            {vm.editing ? (
              <Box sx={fieldHalf}>
                <SelectFieldMUI
                  name="status"
                  label="Estado"
                  value={vm.values.status}
                  onChange={vm.onChangeStatus}
                  options={[...STATUS_OPTIONS]}
                  disabled={readOnly}
                />
              </Box>
            ) : null}
            <Box sx={fieldFull}>
              <TextAreaFieldMUI
                name="notes"
                label="Observaciones"
                value={vm.values.notes}
                onChange={vm.onChangeNotes}
                disabled={readOnly}
                maxlenght={500}
                rows={3}
              />
            </Box>
          </Box>

          {creating && vm.offersEnrollment ? (
            <RadioButtonFieldMUI
              name="chargeEnrollment"
              label="¿Cobrar la cuota de ingreso?"
              value={vm.values.chargeEnrollment ? 'yes' : 'no'}
              direction="row"
              options={[
                { value: 'yes', label: 'Sí' },
                { value: 'no', label: 'No' },
              ]}
              onChange={vm.onChangeChargeEnrollment}
              disabled={readOnly}
            />
          ) : null}

          {vm.formError ? (
            <Typography sx={{ color: colors.error }}>{vm.formError}</Typography>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <HoverIconButton
            text={readOnly ? 'Cerrar' : 'Cancelar'}
            type="button"
            onClick={vm.closeForm}
            sx={theme.customButtons.secondary}
          />
          {readOnly ? null : (
            <HoverIconButton
              text="Guardar"
              type="submit"
              disabled={vm.isSaving}
              sx={theme.customButtons.primary}
            />
          )}
        </DialogActions>
      </Box>
    </AppDialog>
  );
}
