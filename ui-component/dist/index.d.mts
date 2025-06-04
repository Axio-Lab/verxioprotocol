import * as React from 'react';
import { ReactNode } from 'react';
import { VerxioContext } from '@verxioprotocol/core';
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
    context: VerxioContext;
    signer?: KeypairSigner;
    onSuccess?: (result: CreateLoyaltyProgramResult) => void;
    onError?: (error: Error) => void;
}
declare function CreateLoyaltyProgramForm({ context, signer: providedSigner, onSuccess, onError }: CreateLoyaltyProgramFormProps): React.JSX.Element;

interface UpdateLoyaltyProgramResult {
    signature: string;
}
interface UpdateLoyaltyProgramFormProps {
    context: VerxioContext;
    signer: KeypairSigner;
    onSuccess?: (result: UpdateLoyaltyProgramResult) => void;
    onError?: (error: Error) => void;
}
declare function UpdateLoyaltyProgramForm({ context, signer, onSuccess, onError }: UpdateLoyaltyProgramFormProps): React.JSX.Element;

interface IssueLoyaltyPassResult {
    asset: KeypairSigner;
    signature: string;
}
interface IssueLoyaltyPassFormProps {
    context: VerxioContext;
    signer: KeypairSigner;
    onSuccess?: (result: IssueLoyaltyPassResult) => void;
    onError?: (error: Error) => void;
}
declare function IssueLoyaltyPassForm({ context, signer, onSuccess, onError }: IssueLoyaltyPassFormProps): React.JSX.Element;

interface ApproveTransferFormProps {
    context: VerxioContext;
    signer: KeypairSigner;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}
declare function ApproveTransferForm({ context, signer, onSuccess, onError }: ApproveTransferFormProps): React.JSX.Element;

interface MessageResult {
    signature: string;
}
interface MessagingFormProps {
    context: VerxioContext;
    signer: KeypairSigner;
    onSuccess?: (result: MessageResult) => void;
    onError?: (error: Error) => void;
}
declare function MessagingForm({ context, signer, onSuccess, onError }: MessagingFormProps): React.JSX.Element;

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
    context: VerxioContext;
    signer: KeypairSigner;
    onSuccess?: (result: RevokeLoyaltyPointsResult) => void;
    onError?: (error: Error) => void;
}
declare function RevokeLoyaltyPointsForm({ context, signer, onSuccess, onError }: RevokeLoyaltyPointsFormProps): React.JSX.Element;

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
    context: VerxioContext;
    signer: KeypairSigner;
    onSuccess?: (result: GiftLoyaltyPointsResult) => void;
    onError?: (error: Error) => void;
}
declare function GiftLoyaltyPointsForm({ context, signer, onSuccess, onError }: GiftLoyaltyPointsFormProps): React.JSX.Element;

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
    context: VerxioContext;
    onSuccess?: (result: AssetData) => void;
    onError?: (error: Error) => void;
}
declare function GetAssetDataForm({ context, onSuccess, onError }: GetAssetDataFormProps): React.JSX.Element;

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
    context: VerxioContext;
    onSuccess?: (result: ProgramDetails) => void;
    onError?: (error: Error) => void;
}
declare function GetProgramDetailsForm({ context, onSuccess, onError }: GetProgramDetailsFormProps): React.JSX.Element;

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
    context: VerxioContext;
    signer: KeypairSigner;
    onSuccess?: (result: AwardLoyaltyPointsResult) => void;
    onError?: (error: Error) => void;
}
declare function AwardLoyaltyPointsForm({ context, signer, onSuccess, onError }: AwardLoyaltyPointsFormProps): React.JSX.Element;

interface BroadcastResult {
    signature: string;
}
interface BroadcastsFormProps {
    context: VerxioContext;
    signer: KeypairSigner;
    onSuccess?: (result: BroadcastResult) => void;
    onError?: (error: Error) => void;
}
declare function BroadcastsForm({ context, signer, onSuccess, onError }: BroadcastsFormProps): React.JSX.Element;

interface VerxioFormProps<T extends Record<string, any>> {
    form: UseFormReturn<T>;
    onSubmit: (data: T) => void;
    children: ReactNode;
    className?: string;
}
declare function VerxioForm<T extends Record<string, any>>({ form, onSubmit, children, className, }: VerxioFormProps<T>): React.JSX.Element;

interface VerxioFormSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}
declare function VerxioFormSection({ title, description, children, className, }: VerxioFormSectionProps): React.JSX.Element;

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

export { Alert, AlertDescription, AlertTitle, ApproveTransferForm, AwardLoyaltyPointsForm, BroadcastsForm, Button, CreateLoyaltyProgramForm, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, GetAssetDataForm, GetProgramDetailsForm, GiftLoyaltyPointsForm, Input, IssueLoyaltyPassForm, Label, MessagingForm, RevokeLoyaltyPointsForm, UpdateLoyaltyProgramForm, VerxioForm, VerxioFormField, VerxioFormSection };
