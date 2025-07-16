import * as React from 'react';
import { ReactNode } from 'react';
import { KeypairSigner } from '@metaplex-foundation/umi';
import * as react_hook_form from 'react-hook-form';
import { UseFormReturn, Path, FieldValues, FieldPath, ControllerProps } from 'react-hook-form';
import * as class_variance_authority_dist_types from 'class-variance-authority/dist/types';
import { VariantProps } from 'class-variance-authority';
import * as _radix_ui_react_slot from '@radix-ui/react-slot';
import * as LabelPrimitive from '@radix-ui/react-label';

interface CreateLoyaltyProgramResult {
    collection: KeypairSigner;
    signature: string;
    updateAuthority?: KeypairSigner;
}
interface CreateLoyaltyProgramFormProps {
    onSuccess?: (result: CreateLoyaltyProgramResult) => void;
    onError?: (error: Error) => void;
}
declare function CreateLoyaltyProgramForm({ onSuccess, onError }: CreateLoyaltyProgramFormProps): React.JSX.Element;

interface UpdateLoyaltyProgramResult {
    signature: string;
}
interface UpdateLoyaltyProgramFormProps {
    onSuccess?: (result: UpdateLoyaltyProgramResult) => void;
    onError?: (error: Error) => void;
}
declare function UpdateLoyaltyProgramForm({ onSuccess, onError }: UpdateLoyaltyProgramFormProps): React.JSX.Element;

interface IssueLoyaltyPassResult {
    asset: KeypairSigner;
    signature: string;
}
interface IssueLoyaltyPassFormProps {
    onSuccess?: (result: IssueLoyaltyPassResult) => void;
    onError?: (error: Error) => void;
}
declare function IssueLoyaltyPassForm({ onSuccess, onError }: IssueLoyaltyPassFormProps): React.JSX.Element;

interface ApproveTransferFormProps {
    onError?: (error: Error) => void;
}
declare function ApproveTransferForm({ onError }: ApproveTransferFormProps): React.JSX.Element;

interface MessageResult {
    signature: string;
}
interface MessagingFormProps {
    onSuccess?: (result: MessageResult) => void;
    onError?: (error: Error) => void;
}
declare function MessagingForm({ onSuccess, onError }: MessagingFormProps): React.JSX.Element;

interface RevokeLoyaltyPointsResult {
    points: number;
    signature: string;
    newTier: {
        name: string;
        xpRequired: number;
        rewards: string[];
    };
}
interface RevokeLoyaltyPointsFormProps {
    onSuccess?: (result: RevokeLoyaltyPointsResult) => void;
    onError?: (error: Error) => void;
}
declare function RevokeLoyaltyPointsForm({ onSuccess, onError }: RevokeLoyaltyPointsFormProps): React.JSX.Element;

interface GiftLoyaltyPointsResult {
    points: number;
    signature: string;
    newTier: {
        name: string;
        xpRequired: number;
        rewards: string[];
    };
}
interface GiftLoyaltyPointsFormProps {
    onSuccess?: (result: GiftLoyaltyPointsResult) => void;
    onError?: (error: Error) => void;
}
declare function GiftLoyaltyPointsForm({ onSuccess, onError }: GiftLoyaltyPointsFormProps): React.JSX.Element;

interface AssetData {
    xp: number;
    lastAction: string | null;
    actionHistory: any[];
    currentTier: string;
    tierUpdatedAt: number;
    metadata: {
        brandColor?: string;
        organizationName?: string;
    };
    name: string;
    owner: string;
    pass: string;
    rewardTiers: Array<{
        name: string;
        xpRequired: number;
        rewards: string[];
    }>;
    rewards: string[];
    uri: string;
    broadcasts: {
        broadcasts: Array<{
            content: string;
            id: string;
            read: boolean;
            sender: string;
            timestamp: number;
        }>;
        totalBroadcasts: number;
    };
    messageHistory?: Array<{
        content: string;
        id: string;
        read: boolean;
        sender: string;
        timestamp: number;
    }>;
}
interface GetAssetDataFormProps {
    onSuccess?: (result: AssetData) => void;
    onError?: (error: Error) => void;
}
declare function GetAssetDataForm({ onSuccess, onError }: GetAssetDataFormProps): React.JSX.Element;

interface ProgramDetails {
    name: string;
    uri: string;
    collectionAddress: string;
    updateAuthority: string;
    numMinted: number;
    creator: string;
    metadata: {
        brandColor?: string;
        organizationName?: string;
    };
    pointsPerAction: Record<string, number>;
    tiers: Array<{
        name: string;
        xpRequired: number;
        rewards: string[];
    }>;
    transferAuthority: string;
    broadcasts: {
        broadcasts: Array<{
            content: string;
            id: string;
            read: boolean;
            sender: string;
            timestamp: number;
        }>;
        totalBroadcasts: number;
    };
}
interface GetProgramDetailsFormProps {
    onSuccess?: (result: ProgramDetails) => void;
    onError?: (error: Error) => void;
}
declare function GetProgramDetailsForm({ onSuccess, onError }: GetProgramDetailsFormProps): React.JSX.Element;

interface AwardLoyaltyPointsResult {
    points: number;
    signature: string;
    newTier?: {
        name: string;
        xpRequired: number;
        rewards: string[];
    };
}
interface AwardLoyaltyPointsFormProps {
    onSuccess?: (result: AwardLoyaltyPointsResult) => void;
    onError?: (error: Error) => void;
}
declare function AwardLoyaltyPointsForm({ onSuccess, onError }: AwardLoyaltyPointsFormProps): React.JSX.Element;

interface BroadcastResult {
    signature: string;
}
interface BroadcastsFormProps {
    onSuccess?: (result: BroadcastResult) => void;
    onError?: (error: Error) => void;
}
declare function BroadcastsForm({ onSuccess, onError }: BroadcastsFormProps): React.JSX.Element;

interface CreateVoucherCollectionFormProps {
    onSuccess?: (result: any) => void;
    onError?: (error: any) => void;
}
declare function CreateVoucherCollectionForm({ onSuccess, onError }: CreateVoucherCollectionFormProps): React.JSX.Element;

interface MintVoucherFormProps {
    onSuccess?: (result: any) => void;
    onError?: (error: any) => void;
}
declare function MintVoucherForm({ onSuccess, onError }: MintVoucherFormProps): React.JSX.Element;

interface ValidateVoucherFormProps {
    onSuccess?: (result: any) => void;
    onError?: (error: any) => void;
}
declare function ValidateVoucherForm({ onSuccess, onError }: ValidateVoucherFormProps): React.JSX.Element;

interface RedeemVoucherFormProps {
    onSuccess?: (result: any) => void;
    onError?: (error: any) => void;
}
declare function RedeemVoucherForm({ onSuccess, onError }: RedeemVoucherFormProps): React.JSX.Element;

interface GetUserVouchersFormProps {
    onSuccess?: (result: any) => void;
    onError?: (error: any) => void;
}
declare function GetUserVouchersForm({ onSuccess, onError }: GetUserVouchersFormProps): React.JSX.Element;

interface ExtendVoucherExpiryFormProps {
    onSuccess?: (result: any) => void;
    onError?: (error: any) => void;
}
declare function ExtendVoucherExpiryForm({ onSuccess, onError }: ExtendVoucherExpiryFormProps): React.JSX.Element;

interface CancelVoucherFormProps {
    onSuccess?: (result: any) => void;
    onError?: (error: any) => void;
}
declare function CancelVoucherForm({ onSuccess, onError }: CancelVoucherFormProps): React.JSX.Element;

interface VerxioFormProps<T extends Record<string, any>> {
    form: UseFormReturn<T>;
    onSubmit: (data: T) => void;
    children: ReactNode;
    className?: string;
}
declare function VerxioForm<T extends Record<string, any>>({ form, onSubmit, children, className }: VerxioFormProps<T>): React.JSX.Element;

interface VerxioFormSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}
declare function VerxioFormSection({ title, description, children, className }: VerxioFormSectionProps): React.JSX.Element;

interface VerxioFormFieldProps<T extends Record<string, any>> {
    form: UseFormReturn<T>;
    name: Path<T>;
    label: string;
    description?: string;
    children: ReactNode;
    className?: string;
}
declare function VerxioFormField<T extends Record<string, any>>({ form, name, label, description, children, className, }: VerxioFormFieldProps<T>): React.JSX.Element;

declare const alertVariants: (props?: ({
    variant?: "default" | "destructive" | "warning" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string;
declare function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>): React.JSX.Element;
declare function AlertTitle({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
declare function AlertDescription({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;

declare const buttonVariants: (props?: ({
    variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
} & class_variance_authority_dist_types.ClassProp) | undefined) => string;
declare function Button({ className, variant, size, asChild, ...props }: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
}): React.JSX.Element;

declare const Form: <TFieldValues extends FieldValues, TContext = any, TTransformedValues = TFieldValues>(props: react_hook_form.FormProviderProps<TFieldValues, TContext, TTransformedValues>) => React.JSX.Element;
declare const FormField: <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ ...props }: ControllerProps<TFieldValues, TName>) => React.JSX.Element;
declare const FormItem: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
declare const FormLabel: React.ForwardRefExoticComponent<Omit<LabelPrimitive.LabelProps & React.RefAttributes<HTMLLabelElement>, "ref"> & React.RefAttributes<HTMLLabelElement>>;
declare const FormControl: React.ForwardRefExoticComponent<Omit<_radix_ui_react_slot.SlotProps & React.RefAttributes<HTMLElement>, "ref"> & React.RefAttributes<HTMLElement>>;
declare const FormDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
declare const FormMessage: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;

declare function Input({ className, type, ...props }: React.ComponentProps<'input'>): React.JSX.Element;

declare const Label: React.ForwardRefExoticComponent<Omit<LabelPrimitive.LabelProps & React.RefAttributes<HTMLLabelElement>, "ref"> & React.RefAttributes<HTMLLabelElement>>;

export { Alert, AlertDescription, AlertTitle, ApproveTransferForm, AwardLoyaltyPointsForm, BroadcastsForm, Button, CancelVoucherForm, CreateLoyaltyProgramForm, CreateVoucherCollectionForm, ExtendVoucherExpiryForm, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, GetAssetDataForm, GetProgramDetailsForm, GetUserVouchersForm, GiftLoyaltyPointsForm, Input, IssueLoyaltyPassForm, Label, MessagingForm, MintVoucherForm, RedeemVoucherForm, RevokeLoyaltyPointsForm, UpdateLoyaltyProgramForm, ValidateVoucherForm, VerxioForm, VerxioFormField, VerxioFormSection };
