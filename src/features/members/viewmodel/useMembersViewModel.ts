'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useUserStore } from '@/core/store/useUserStore';
import { selectUserPermissions } from '@/core/store/userPermissions';
import { useSessionStore } from '@/core/store/useSessionStore';
import { MembersService } from '../domain/membersService';
import {
  deliveryMode,
  emptyBenefitDeliveryForm,
  emptyMemberForm,
  formValuesFromMember,
  matchesMemberSearch,
  toProfileSelectOptions,
  type BenefitDeliveryFormErrors,
  type BenefitDeliveryFormValues,
  type MemberBenefitRecord,
  type MemberDetail,
  type MemberFormErrors,
  type MemberFormValues,
  type MemberRecord,
  type MembersSettings,
  type ProfileOption,
  type DocumentTypeCode,
  type MemberStatusCode,
  type SexCode,
} from '../domain/membersTypes';

const LOAD_ERROR = 'No pudimos cargar los afiliados.';

function errorMessage(error: unknown, fallback: string): string {
  const message = (error as { message?: string } | null)?.message;
  return message?.trim() || fallback;
}

export function useMembersViewModel() {
  const service = useMemo(() => new MembersService(), []);
  const permissions = useUserStore(selectUserPermissions);
  const setToast = useSessionStore((state) => state.setToast);
  const setLoading = useSessionStore((state) => state.setLoading);
  const canCreate = permissions.includes('members.create');
  const canEdit = permissions.includes('members.edit');
  const canDeliver = permissions.includes('benefits.deliver');
  const canDeliverException = permissions.includes('benefits.deliver_exception');
  const canRegisterDelivery = canDeliver || canDeliverException;

  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [settings, setSettings] = useState<MembersSettings>({
    minimumWage: 0,
    enrollmentFee: 0,
    firstFeeCutoffDay: 15,
    firstFeePercent: '50.00',
  });
  const [today, setToday] = useState('');
  const [loadError, setLoadError] = useState('');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProfileId, setFilterProfileId] = useState('');
  const [filterSex, setFilterSex] = useState('');
  const [filterInArrears, setFilterInArrears] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MemberRecord | null>(null);
  const [values, setValues] = useState<MemberFormValues>(emptyMemberForm());
  const [errors, setErrors] = useState<MemberFormErrors>({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [detailError, setDetailError] = useState('');
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [deliverTarget, setDeliverTarget] = useState<MemberBenefitRecord | null>(null);
  const [deliverValues, setDeliverValues] = useState<BenefitDeliveryFormValues>(
    emptyBenefitDeliveryForm(),
  );
  const [deliverErrors, setDeliverErrors] = useState<BenefitDeliveryFormErrors>({});
  const [deliverError, setDeliverError] = useState('');
  const [isDelivering, setIsDelivering] = useState(false);

  const sortMembers = (rows: MemberRecord[]) =>
    [...rows].sort((left, right) => {
      const last = left.lastNames.localeCompare(right.lastNames, 'es');
      return last !== 0 ? last : left.firstNames.localeCompare(right.firstNames, 'es');
    });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    service
      .load()
      .then((page) => {
        if (cancelled) return;
        setMembers(page.members);
        setProfiles(page.profiles);
        setSettings(page.settings);
        setToday(page.today);
        setLoadError('');
      })
      .catch((error) => {
        if (!cancelled) setLoadError(errorMessage(error, LOAD_ERROR));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [service, setLoading]);

  const visibleMembers = useMemo(
    () =>
      members.filter((row) => {
        if (!matchesMemberSearch(row, search)) return false;
        if (filterStatus && row.status !== filterStatus) return false;
        if (filterProfileId && row.profileId !== filterProfileId) return false;
        if (filterSex && row.sex !== filterSex) return false;
        if (filterInArrears === 'yes' && !row.inArrears) return false;
        if (filterInArrears === 'no' && row.inArrears) return false;
        return true;
      }),
    [members, search, filterStatus, filterProfileId, filterSex, filterInArrears],
  );

  const wageIsZero = settings.minimumWage <= 0;
  const offersEnrollment = settings.enrollmentFee > 0;
  const profileOptions = toProfileSelectOptions(profiles, editing?.profileId);

  const openCreate = () => {
    if (!canCreate || wageIsZero) return;
    setEditing(null);
    setValues(service.createEmptyForm(today));
    setErrors({});
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (row: MemberRecord) => {
    if (!canEdit) return;
    setEditing(row);
    setValues(formValuesFromMember(row));
    setErrors({});
    setFormError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const openDetail = async (row: MemberRecord) => {
    setDrawerOpen(true);
    setDetailError('');
    setIsLoadingDetail(true);
    try {
      setDetail(await service.loadDetail(row.id));
    } catch (error) {
      setDetail(null);
      setDetailError(errorMessage(error, 'No pudimos cargar la ficha.'));
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    if (isDelivering) return;
    setDrawerOpen(false);
    setDeliverTarget(null);
  };

  const fichaYear = Number(today.slice(0, 4)) || 0;
  const deliverModeValue = deliverTarget
    ? deliveryMode(deliverTarget, canDeliver, canDeliverException)
    : null;

  const openDeliver = (benefit: MemberBenefitRecord) => {
    if (!canRegisterDelivery || !detail || !today) return;
    setDeliverTarget(benefit);
    setDeliverValues(emptyBenefitDeliveryForm(today));
    setDeliverErrors({});
    setDeliverError('');
  };

  const closeDeliver = () => {
    if (isDelivering) return;
    setDeliverTarget(null);
  };

  const confirmDeliver = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isDelivering || !canRegisterDelivery || !detail || !deliverTarget) return;
    if (deliverModeValue !== 'normal' && deliverModeValue !== 'exception') return;
    const prepared = service.prepareDelivery(
      detail.id,
      deliverTarget.id,
      deliverValues,
      today,
      fichaYear,
      deliverModeValue === 'exception',
    );
    if (!prepared.ok) {
      setDeliverErrors(prepared.errors);
      return;
    }
    setIsDelivering(true);
    setDeliverError('');
    try {
      await service.deliver(prepared.payload);
      const wasException = deliverModeValue === 'exception';
      setDeliverTarget(null);
      setToast({
        show: true,
        icon: 'checkmark-circle',
        title: 'Entrega registrada',
        description: wasException
          ? 'Quedó como excepción, con la nota en la bitácora.'
          : 'Quedó registrada para el año de la fecha.',
      });
      try {
        setDetail(await service.loadDetail(detail.id));
        setDetailError('');
      } catch (refreshError) {
        setDetailError(
          errorMessage(
            refreshError,
            'La entrega quedó registrada, pero no pudimos refrescar la ficha.',
          ),
        );
      }
    } catch (error) {
      setDeliverError(errorMessage(error, 'No pudimos registrar la entrega.'));
    } finally {
      setIsDelivering(false);
    }
  };

  const saveForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    if (editing && !canEdit) return;
    if (!editing && !canCreate) return;
    setIsSaving(true);
    setFormError('');
    try {
      if (editing) {
        const prepared = service.prepareUpdate(values);
        if (!prepared.ok) {
          setErrors(prepared.errors);
          return;
        }
        const updated = await service.update(editing.id, prepared.payload);
        setMembers((current) =>
          sortMembers(current.map((item) => (item.id === updated.id ? updated : item))),
        );
        if (detail?.id === updated.id) {
          setDetail(await service.loadDetail(updated.id));
        }
      } else {
        const prepared = service.prepareCreate(values);
        if (!prepared.ok) {
          setErrors(prepared.errors);
          return;
        }
        const created = await service.create(prepared.payload);
        setMembers((current) => sortMembers([...current, created]));
      }
      setFormOpen(false);
      setToast({
        show: true,
        icon: 'checkmark-circle',
        title: editing ? 'Afiliado actualizado' : 'Afiliado creado',
        description: editing
          ? 'Los cambios de perfil no alteran las cuotas ya generadas.'
          : 'Se asignó el número y se generó la cuota del mes.',
      });
    } catch (error) {
      setFormError(errorMessage(error, 'No pudimos guardar el afiliado.'));
    } finally {
      setIsSaving(false);
    }
  };

  const patchField = <K extends keyof MemberFormValues>(key: K, value: MemberFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  return {
    canCreate,
    canEdit,
    canRegisterDelivery,
    members: visibleMembers,
    profiles,
    profileOptions,
    settings,
    today,
    wageIsZero,
    offersEnrollment,
    loadError,
    search,
    filterStatus,
    filterProfileId,
    filterSex,
    filterInArrears,
    formOpen,
    editing,
    values,
    errors,
    formError,
    isSaving,
    drawerOpen,
    detail,
    detailError,
    isLoadingDetail,
    deliverTarget,
    deliverValues,
    deliverErrors,
    deliverError,
    isDelivering,
    deliverModeValue,
    fichaYear,
    setSearch,
    setFilterStatus,
    setFilterProfileId,
    setFilterSex,
    setFilterInArrears,
    openCreate,
    openEdit,
    closeForm,
    openDetail,
    closeDetail,
    openDeliver,
    closeDeliver,
    confirmDeliver,
    onChangeDeliveredOn: (event: ChangeEvent<HTMLInputElement>) =>
      setDeliverValues((current) => ({ ...current, deliveredOn: event.target.value })),
    onChangeDeliveryNote: (event: ChangeEvent<HTMLInputElement>) =>
      setDeliverValues((current) => ({ ...current, note: event.target.value })),
    saveForm,
    onChangeDocumentType: (value: string) =>
      patchField('documentType', value as DocumentTypeCode),
    onChangeDocumentNumber: (event: ChangeEvent<HTMLInputElement>) =>
      patchField('documentNumber', event.target.value),
    onChangeFirstNames: (event: ChangeEvent<HTMLInputElement>) =>
      patchField('firstNames', event.target.value),
    onChangeLastNames: (event: ChangeEvent<HTMLInputElement>) =>
      patchField('lastNames', event.target.value),
    onChangeSex: (event: ChangeEvent<HTMLInputElement>) =>
      patchField('sex', event.target.value as SexCode),
    onChangeBirthDate: (event: ChangeEvent<HTMLInputElement>) =>
      patchField('birthDate', event.target.value),
    onChangeMobilePhone: (event: ChangeEvent<HTMLInputElement>) =>
      patchField('mobilePhone', event.target.value),
    onChangePhone: (event: ChangeEvent<HTMLInputElement>) =>
      patchField('phone', event.target.value),
    onChangeEmail: (event: ChangeEvent<HTMLInputElement>) =>
      patchField('email', event.target.value),
    onChangeAddress: (event: ChangeEvent<HTMLInputElement>) =>
      patchField('address', event.target.value),
    onChangeResidenceCity: (event: ChangeEvent<HTMLInputElement>) =>
      patchField('residenceCity', event.target.value),
    onChangeShirtSize: (event: ChangeEvent<HTMLInputElement>) =>
      patchField('shirtSize', event.target.value),
    onChangePantsSize: (event: ChangeEvent<HTMLInputElement>) =>
      patchField('pantsSize', event.target.value),
    onChangeShoeSize: (event: ChangeEvent<HTMLInputElement>) =>
      patchField('shoeSize', event.target.value),
    onChangeJoinedOn: (event: ChangeEvent<HTMLInputElement>) =>
      patchField('joinedOn', event.target.value),
    onChangeProfileId: (value: string) => patchField('profileId', value),
    onChangeStatus: (value: string) =>
      patchField('status', value as MemberStatusCode),
    onChangeNotes: (event: ChangeEvent<HTMLInputElement>) =>
      patchField('notes', event.target.value),
    onChangeChargeEnrollment: (event: ChangeEvent<HTMLInputElement>) =>
      patchField('chargeEnrollment', event.target.value === 'yes'),
  };
}
